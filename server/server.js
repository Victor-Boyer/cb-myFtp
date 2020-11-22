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
      fs.writeFile('save.json', '',function (err) {
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
  let cnt;
  let userNameOk = false;
  let passOk = false;
  let isConnected = false;

  socket.on('data', function(data) {

  let array_data = data.toString().split(' ');

    /* USER COMMAND */
    if(array_data[0] == 'USER' || array_data[0] == 'user') {
      for(let i=0; i < save.users.length; i++) {
        if(save.users[i].username == array_data[1]) {
          cnt = i;
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
      if(save.users[cnt].password == array_data[1]) {
          socket.write('Good password ! Welcome back ' + save.users[cnt].username);
          console.log('User '+ save.users[cnt].username + ' connected.');
          passOk = true;
          isConnected = true;
      }
      else if (passOk == false) {
        socket.write('Wrong password for : ' + save.users[cnt].username);
      }
      passOk = false;
    }
    
    /* LIST COMMAND */
    else if (array_data[0] == 'LIST' || array_data[0] == 'list') {
      if(isConnected == false) {
        socket.write('You\'re not connected, use USER and PASS command to connect');
      }
      else {
        try {
          fs.readdir(process.cwd(), (err, files) => {
            socket.write('List of file from ' + process.cwd() + ' : \n' )
            files.forEach(file => {
              socket.write(file + '\n');
            });
          });
        } catch (err) {
          socket.write('Error: cannot display the file list.')
        }
      }
    }

    /* CWD COMMAND */
    else if (array_data[0] == 'CWD' || array_data[0] == 'cwd') {
      if(isConnected == false) {
        socket.write('You\'re not connected, use USER and PASS command to connect');
      }
      else {
        try {
          process.chdir(array_data[1]);
          socket.write(`New directory: ${process.cwd()}`);
        } catch (err) {
          socket.write('ERROR : path doesn\'t exist' + err)
          console.error(`ERROR : chdir: ${err}`);
        }
      } 
    }

    /* PWD COMMAND */
    else if (array_data[0] == 'PWD' || array_data[0] == 'pwd') {
      if(isConnected == false) {
        socket.write('You\'re not connected, use USER and PASS command to connect');
      }
      else {
        socket.write('Current directory : ' + process.cwd());
      }
    }

    /* HELP COMMAND */
    else if (array_data[0] == 'HELP' || array_data[0] == 'help') {
      if(isConnected == false) {
        socket.write('You\'re not connected, use USER and PASS command to connect');
      }
      else {
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
    }

     /* STOR COMMAND */
     else if (array_data[0] == 'STOR' || array_data[0] == 'stor') {
      if(isConnected == false) {
        socket.write('You\'re not connected, use USER and PASS command to connect');
      }
      else {
        socket.write('stor ' + array_data[1]);
        if(array_data[1] == 'pipe_on') {
          let stor_data = data.toString().split('|');
          try {
            fs.writeFile('./storage/ '+ stor_data[2].toString(), stor_data[1], function() {
              socket.write('Transfer done.');
              console.log('Transfer done');
            });
          } catch (err) {
            console.error('Error, cannot download the file. Maybe it already exist.');
          }
        }
        console.log('STOR command had been used');
      }
    }

    /* RETR COMMAND */
     else if (array_data[0] == 'RETR' || array_data[0] == 'retr') {
      if(isConnected == false) {
        socket.write('You\'re not connected, use USER and PASS command to connect');
      }
      else {
        console.log('executing...');
        try {
          let file = fs.readFileSync( process.cwd() +'/storage/'+ array_data[1] + '');
          let fileName = path.basename('./storage/'+ array_data[1] + '');
          socket.write( 'retr |'+ file + '|' + fileName);
        } catch (err) {
          socket.write('No such file called : ' + array_data[1]);
        }
      }
      console.log('RETR command had been used');
    }

    /* QUIT COMMAND */
    else if (array_data[0] == 'QUIT' || array_data[0] == 'quit') {
      socket.write('You have been disconnected. See you soon !');
      isConnected = false;
      socket.emit('close')
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

  