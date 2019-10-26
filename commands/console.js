module.exports = {
  name: 'console',
  admin: true,
  execute: (msg, args, globals) => {
    globals.server.stdin.write(args.join(' ') + '\n');
  }
}
