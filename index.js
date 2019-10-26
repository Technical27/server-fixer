const Discord = require('discord.js')
const config = require('./config.json')
const fs = require('fs')
const {spawn} = require('child_process');
const path = require('path');

const client = new Discord.Client();
const commands = new Map();

let server, consoleChannel;

const globals = {};

let serverOutputBuf = '';

const logServer = () => {
  const lines = serverOutputBuf.split('\n');
  if (lines.length > 1) {
    serverOutputBuf = '';
    const message = lines.join('\n');
    if (message.length > 2000) {
      consoleChannel.send(`server output:\n\`${message.slice(0, 1980)}...\``);
      serverOutputBuf = message.slice(1980);
    }
    else consoleChannel.send(`server output:\n\`${message}\``);
  }
  setTimeout(logServer, 1500);
};

const startServer = () => {
  server = spawn('java', ['-Xmx2G', '-jar', 'server.jar', '-nogui'], {cwd: path.join(__dirname, 'server')});
  globals.server = server;
  consoleChannel = client.channels.get(config.console);
  server.stdout.on('data', s => {
    serverOutputBuf += s;
  });
  server.on('exit', (code, signal) => {
    globals.serverExitCode = code;
    globals.serverExitSignal = signal;
    globals.serverAlive = false;
  });
  globals.serverAlive = true;
  setTimeout(logServer, 1500);
};

client.on('ready', () => {
  console.log(`logged on as ${client.user.tag}`);
  startServer();
});

client.on('message', msg => {
  if (msg.author.bot) return;

  if (msg.channel.id === config.console) {
    if (config.admins.includes(msg.author.id)) {
      if (globals.serverAlive) return server.stdin.write(msg.content + '\n');
    }
  }

  if (!msg.content.startsWith('-')) return;

  const args = msg.content.slice(1).split(/\s+/); 
 
  const cmd = args.shift().toLowerCase();

  if (!commands.has(cmd)) return;
  
  if (commands.get(cmd).admin && !config.admins.includes(msg.author.id)) {
    return msg.channel.send('you don\'t have permission to use this command');
  }

  try {
    commands.get(cmd).execute(msg, args, globals);
  }
  catch (e) {
    console.error(e);
    msg.channel.send(`something broke and here's the error:\n\`${e}\``);
  }
});

process.on('SIGINT', async () => {
  console.log('destroying client');
  await client.destroy();
  console.log('closeing server');
  server.kill('SIGINT');
  process.exit();
});

const loadCommands = () => {
  fs.readdirSync('commands').filter(f => f.endsWith('.js')).forEach(f => {
    const cmd = require(path.join(__dirname, 'commands', f));
    commands.set(cmd.name, cmd);
  });
};

loadCommands();

globals.commands = commands;
globals.startServer = startServer;

client.login(config.token);
