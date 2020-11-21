const net = require('net')
var fs = require('fs');
var save = require('./save.json');

const port = process.argv[2]


fs.stat('./save.json', function(err) {
  if (!err) {
      console.log('Save file exist');
  }
  else if (err.code === 'ENOENT') {
      console.log('Save file does not exist... Creating a new one...');
      fs.writeFile('s ave.json', '',function (err) {
        if (err) throw err;
        console.log('Created !');
      }); 
  }
});

if (!port) {
  console.log('usage: node e01.js <port>')
  process.exit(0)
}

const server = net.createServer((socket) => {
  socket.write('Hello client ! Glad to see you\n');
  var cnt;
  var userNameOk = false;
  var passOk = false;

  socket.on('data', function(data) {
   var array_data = data.toString().split(' ');

    /* USER COMMAND */
    if(array_data[0] == 'USER' || array_data[0] == 'user') {
      for(let i=0; i < save.users.length; i++) {
        if(save.users[i].username == array_data[1]) {
          userNameOk = true;
          socket.write('Username found : ' + save.users[i].username);
        }
      }
      if (userNameOk == false) {
        socket.write('Error : Username unknown');
      }
      console.log('USER command had been used.');
      userNameOk = false;
    }

    /* PASS COMMAND */
    else if (array_data[0] == 'PASS' || array_data[0] == 'pass') {
      for(let i=0; i < save.users.length; i++) {
        if(save.users[i].password == array_data[1]) {
          cnt = i;
          socket.write('User found with this password: ' + save.users[cnt].username);
          passOk = true;
        }
      }
      if (passOk == false) {
        socket.write('0 user found. This password doesn\'t exist');
      }
      console.log('PASS command had been used.');
      passOk = false;
    }
    
    /* LIST COMMAND */
    else if (array_data[0] == 'LIST' || array_data[0] == 'list') {
      fs.readdir(process.cwd(), (err, files) => {
        socket.write('List of file from ' + process.cwd() + ' : ' )
        files.forEach(file => {
          socket.write(file);
        });
      });
      socket.write('Current directory : ' + process.cwd());
    }

    /* CWD COMMAND */
    else if (array_data[0] == 'CWD' || array_data[0] == 'cwd') {
      try {
        process.chdir(array_data[1]);
        socket.write(`New directory: ${process.cwd()}`);
      } catch (err) {
        socket.write('ERROR : path doesn\'t exist' + err)
        console.error(`ERROR : chdir: ${err}`);
      }
    }

    /* PWD COMMAND */
    else if (array_data[0] == 'PWD' || array_data[0] == 'pwd') {
      socket.write('Current directory : ' + process.cwd());
    }

    /* HELP COMMAND */
    else if (array_data[0] == 'HELP' || array_data[0] == 'help') {
      socket.write('Here the list of all the commands you can use : ' + '\n' +
                  'USER <username>: check if the user exist' + '\n' +
                  'PASS <password>: authenticate the user with a password' + '\n' +
                  'LIST: list the current directory of the server' + '\n' +
                  'CWD <directory>: change the current directory of the server' + '\n' +
                  'RETR <filename>: transfer a copy of the file FILE from the server to the client' + '\n' +
                  'STOR <filename>: transfer a copy of the file FILE from the client to the server' + '\n' +
                  'PWD: display the name of the current directory of the server' + '\n' +
                  'HELP: send helpful information to the client' + '\n' +
                  'QUIT: close the connection and stop the program'
                  );
    }

    else {
      socket.write('Error : command "' + array_data[0] + '" not found...')
    }

  });
}).on('error', (err) => {
    // Handle errors here.
    throw err;
  });

  server.listen(port, () => {
    console.log('opened server on', server.address());
  });

  