module.exports = {
  name: 'start',
  admin: true,
  execute: (msg, args, globals) => {
    if (globals.serverAlive) {
      msg.channel.send('Server is still up!');
    }
    else {
      msg.channel.send('Starting server');
      globals.startServer();
    }
  }
}
