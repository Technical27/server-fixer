module.exports = {
  name: 'stop',
  admin: true,
  execute: (msg, args, globals) => {
    if (globals.serverAlive) {
      msg.channel.send('stopping server');
      globals.server.stdin.write('stop\n');
    }
    else {
      msg.channel.send('server is already stopped');
    }
  }
}
