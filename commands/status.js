module.exports = {
  name: 'status',
  execute: (msg, args, globals) => {
    if (globals.serverAlive) {
      msg.channel.send('The server is up');
    }
    else {
      msg.channel.send('The server is down');
    }
  }
}
