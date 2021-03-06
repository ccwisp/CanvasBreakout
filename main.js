

  let canvas = document.getElementById("canvas");
  let context = canvas.getContext("2d");

  let bricks = [];

  var livecount = 3;
  var scorecount = 0;
  var currentlevel = 1;

  var brickrows;

  var mainmusic = new Audio('music.mp3');
  var colsound = new Audio('music1.wav');
  var breaksnd = new Audio('cl2.wav');
  var gameoversnd = new Audio('gameover.wav');
  

  var key_left = false;
  var key_right = false;
  var key_start = false;

  var speed = Math.sqrt(2)/5; //default, when xD and yD = 1

  const xpadding = 10;
  const ypadding = 10;
  const brickcolors =  ['#ffb84d' , '#ff9900', '#b35900', ' #804d00']
      //['#b35900', '#4d0099', 'blue', '#331a00'];
  let br = {
      x: 270,
      y: 450,
      width: 60,
      height: 10,
      xDelta: 3,
      color: ''
  };
  // aqumarine '#7FFFD4'
  let ball = {
      x: 300,
      y: 440,
      height: 10,
      width: 0,
      xDelta: 2,
      yDelta: -2,
      color: '#e6ac00'
  };


  let defaultx = br.xDelta;


  // INFO BAR


  // LEVELS MAP
  let Levelmap = [];

  Levelmap[0]='000111111000-001121121100-001121121100-011111111110-011132231110-010133331010-010111111010';
  Levelmap[2]='010203302010-003201102030-101010101010-010101010101-000000000000-000000000000-000000000000';
  Levelmap[3]='000001100000-000010010000-000100001000-001003300100-000100001000-000010010000-000001100000';
  Levelmap[4]='040000000040-001100110011-110011001100-202020202020-020202020202-303030303030-040404040404';
  Levelmap[5]='102030400040-001100110011-110011001100-202020202020-020202020202-303030303030-040404040404';
  Levelmap[6]='000111111000-001120021100-001120021100-011111111110-011111111110-010111111010-010111111010';
  Levelmap[7]='000300003000-000000000000-002220022200-111000000111-111111111111-000000000000-000004400000';
  Levelmap[8]='011000001110-100100001010-100000001000-100000001110-100000000010-100100001010-011000001110';
  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('keyup', handleKeyUp, true);
  window.addEventListener('keydown', handleKeyStart, true);

  // To loop main music
  mainmusic.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
  }, false);




  function handleKeyStart(event) {
      if (event.keyCode == 32) {
          key_start = true;
          mainmusic.play();
          mainmusic.loop=true;
      }
  }
  function handleKeyDown(event) {
      if (event.keyCode == 37)
          key_left = true;
      else if (event.keyCode == 39)
          key_right = true;
  }

  function handleKeyUp(event) {
      if (event.keyCode == 37)
          key_left = false;
      else if (event.keyCode == 39)
          key_right = false;
  }

  const getlist = function() {
      $.ajax({
          url: "/index",
          type: 'get',
          dataType: 'json',
          contentType: 'json',
          success: function (data) {
              var byScore = data.slice(0);
              byScore.sort(function (a, b) {
                  return a.score - b.score;
              });
              byScore.reverse();
              for (item = 0; item <= 4; item++) {

                  $('#scorebody').append('<tr><td>' + byScore[item].name + '</td><td>' + byScore[item].score + '</td></tr>');
              }
              ;




          },
          error: function (data) {
              alert('Error ');
          }


      });
  };

  const sendscore = function() {
      do{
          input = prompt("Game Over" +
              ". Enter your name");
      }while(input == null || !input.replace(/\s/g, '').length );
      $.ajax({
          url: "/index",
          type: 'post',
          dataType: 'json',
          data: JSON.stringify({
              name: input,
              score: scorecount
          }),
          contentType: "application/json; charset=utf-8",
          success: function (data) {
              // REFRESH THE LIST
              $('#scorebody').html('');
          },
          error: function (data) {
              alert('Error');
          }
      });
  };

  const preparelevel = function () {
      brickrows = Levelmap[currentlevel - 1].split('-');
      bricks = [];
      for (i = 0; i < 7; i++) {
          let l = brickrows[i];
          for (j = 0; j < 12; j++) {
              let yy = ypadding * (i + 1) + i * 20;
              let xx = xpadding * (j + 1) + j * 40;
              if (l.substr(j, 1) != '0') {
                  bricks.push({
                      x: xx,
                      y: yy,
                      width: 40,
                      height: 20,
                      bricktype: l.substr(j, 1)
                  })
              }
          }
      }

      getlist()
  };
  const drawbricks = function () {

      bricks.forEach(function (brick) {
          if (brick.bricktype >= 0) {
//           context.fillStyle=brick.color;
              context.fillStyle = brickcolors[brick.bricktype - 1];
              context.fillRect(brick.x, brick.y, brick.width, brick.height);
          }
      });
  };


  const drawball = function () {

      context.fillStyle = ball.color;
      context.beginPath();
      context.arc(ball.x, ball.y, ball.height, 0, 2 * Math.PI);
      context.fill();
      if (!key_start) {
          ball.x = br.x + br.width / 2;
          return;
      }

      ball.x += ball.xDelta;
      ball.y += ball.yDelta;
      if (ball.y - ball.height - 1 <= 0) {
          ball.yDelta *= -1;
      }
// AUT
      if (ball.y + ball.height >= canvas.height) {
          ball.yDelta *= -1;
          livecount--;
          scorecount = scorecount - 5;
          $('#scorecount').html(scorecount);
          if (livecount == 0) {
              currentlevel = 1;
              $('#livecount').html(0);
              scorecount = scorecount - 5;


                  gameoversnd.play();

                  sendscore();

              $('#scorebody').html('');
              //mainmusic.stop();


              bricks = [];
              livecount = 3;
              currentlevel = 1;
              scorecount = 0;
              preparelevel();
          }
          initgame();
          return;
      }
// Touch left and right wall
      if (ball.x - ball.height <= 0 || ball.x + ball.height  >= canvas.width - 1) {
          ball.xDelta *= -1;
          return;
      }

// Check collision with br top side
      if (ball.yDelta> 0 && ball.x >= br.x && ball.x <= br.x + br.width && ball.y + ball.height >= br.y && ball.y < br.y) {
          ball.yDelta *= -1;
//  change ball angle
          ball.xDelta = Math.round(((ball.x - br.x) - br.width / 2) / 10);
          return;
      }
// Check collision with br left-top corner
      if (ball.yDelta> 0 && ball.x < br.x &&
          ball.x + ball.height > br.x &&
          Math.pow((ball.x - br.x), 2) + Math.pow((ball.y - br.y), 2) <= Math.pow(ball.height, 2)) {
          ball.yDelta *= -1;
          ball.xDelta *= -1;
          return;
      }
// Check collision with br right-top corner
      if (ball.yDelta> 0 && ball.x > br.x + br.width &&
          ball.x - ball.height < br.x + br.width &&
          Math.pow((ball.x - br.x - br.width), 2) + Math.pow((ball.y - br.y), 2) <= Math.pow(ball.height, 2)) {
          ball.yDelta *= -1;
          ball.xDelta *= -1;
          return;
      }

//  Check collision with bricks
      let bb = -1;
      for (i = 0; i < bricks.length; i++) {
// Collision with bottom side of brick
          if ((ball.yDelta < 0) &&
              (ball.x >= bricks[i].x) &&
              (ball.x <= bricks[i].x + bricks[i].width) &&
              (ball.y - ball.height <= bricks[i].y + bricks[i].height) &&
              (ball.y > bricks[i].y)) {
              ball.yDelta *= -1;
              bricks[i].bricktype -= 1;
              bb = i;
              break;
          }
// Collision with top side of brick
          if (bb == -1 && (ball.yDelta > 0) &&
              (ball.x >= bricks[i].x) &&
              (ball.x <= bricks[i].x + bricks[i].width) &&
              (ball.y + ball.height >= bricks[i].y) &&
              (ball.y < bricks[i].y + bricks[i].height)) {
              ball.yDelta *= -1;
              bricks[i].bricktype -= 1;
              bb = i;
              break;
          }
// Collision with left side of brick
          if (bb == -1 && (ball.xDelta > 0) &&
              (ball.y >= bricks[i].y) &&
              (ball.y <= bricks[i].y + bricks[i].height) &&
              (ball.x + ball.height >= bricks[i].x) &&
              (ball.x < bricks[i].x)) {
              ball.xDelta *= -1;
              bricks[i].bricktype -= 1;
              bb = i;
              break;
          }
// Collision with right side of brick
          if (bb == -1 && (ball.xDelta < 0) &&
              (ball.y >= bricks[i].y) &&
              (ball.y <= bricks[i].y + bricks[i].height) &&
              (ball.x - ball.height <= bricks[i].x) &&
              (ball.x > bricks[i].x + bricks[i].width)) {
              ball.xDelta *= -1;
              bricks[i].bricktype -= 1;
              bb = i;
              break;
          }

// Collision with brick`s corners
// top-left
          if (bb == -1 && ball.x < bricks[i].x &&
              ball.x + ball.height > bricks[i].x &&
              Math.pow((ball.x - bricks[i].x), 2) + Math.pow((ball.y - bricks[i].y), 2) <= Math.pow(ball.height, 2)) {
              ball.yDelta *= -1;
              ball.xDelta *= -1;
              bricks[i].bricktype -= 1;
              bb = i;
              break;
          }

// top-right
          if (bb == -1 && ball.x > bricks[i].x + bricks[i].width &&
              ball.x - ball.height < bricks[i].x + bricks[i].width &&
              Math.pow((ball.x - bricks[i].x - bricks[i].width), 2) + Math.pow((ball.y - bricks[i].y), 2) <= Math.pow(ball.height, 2)) {
              ball.yDelta *= -1;
              ball.xDelta *= -1;
              bricks[i].bricktype -= 1;
              bb = i;
              break;
          }
// bottom-left
          if (bb == -1 && ball.x < bricks[i].x &&
              ball.x + ball.height > bricks[i].x &&
              Math.pow((ball.x - bricks[i].x), 2) + Math.pow((ball.y - bricks[i].y - bricks[i].height), 2) <= Math.pow(ball.height, 2)) {
              ball.yDelta *= -1;
              ball.xDelta *= -1;
              bricks[i].bricktype -= 1;
              bb = i;
              break;
          }
// bottom-right
          if (bb == -1 && ball.x > bricks[i].x + bricks[i].width &&
              ball.x - ball.height < bricks[i].x + bricks[i].width &&
              Math.pow((ball.x - bricks[i].x - bricks[i].width), 2) + Math.pow((ball.y - bricks[i].y - bricks[i].height), 2) <= Math.pow(ball.height, 2)) {
              ball.yDelta *= -1;
              ball.xDelta *= -1;
              bricks[i].bricktype -= 1;
              bb = i;
              break;
          }

      }
// delete brick from array
      if (bb > -1) {
          $('#scorecount').html(++scorecount);
          colsound.play();
          if (bricks[bb].bricktype == 0) {
              bricks.splice(bb, 1);

              bb = -1;
              breaksnd.play();
          }
          // next level
          if (bricks.length == 0) {
              currentlevel++;
              livecount++;
              $('#livecount').html(livecount + 1);
              if (currentlevel > Levelmap.length) currentlevel = 1;
              $('#scorebody').html('');
              bricks = [];
              preparelevel();




              initgame();
          }
      }

  };
  const drawbr = function () {

      context.fillRect(br.x, br.y, br.width, br.height);
      if (br.x > canvas.width - 100) {
          if (br.x + br.width >= canvas.width) br.xDelta = 0;
          if (br.xDelta === 0 && key_left) {
              br.xDelta = defaultx;
              br.x -= br.xDelta;
          }
      }
      if (br.x < 100) {
          if (br.x <= 0) br.xDelta = 0;
          if (br.xDelta === 0 && key_right) {
              br.xDelta = defaultx;
              br.x += br.xDelta;
          }
      }
      if (key_left) {
          br.x -= br.xDelta;
      }
      if (key_right) {

          br.x += br.xDelta;

      }

  };
// 5 * Math.sqrt(2)/Math.sqrt(Math.pow(ball.xDelta,2) + Math.pow(ball.yDelta, 2))
  let animate = function () {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawbricks();
      drawball();
      drawbr();
      var interval = 5;
      switch (Math.abs(Math.floor(ball.xDelta))) {
          case 1 :
              interval = 5;
              br.xDelta = 3;
              break;
          case 2 :
              interval = 10;
              br.xDelta = 4;
              break;
          case 3 :
              interval = 13;
              br.xDelta = 5;
              break;
          default :
              interval = 5;
              br.xDelta = 3;
      }

      setTimeout(animate, interval);
  };
      let initgame = function () {
          context.clearRect(0, 0, canvas.width, canvas.height);
          br.x = 270;
          br.y = 450;
          br.width = 60;
          br.height = 10;
          br.xDelta = 3;
          br.color = '#F0F8FF';
          br.type = 'br';
          defaultx = br.xDelta;
          //context.lineWidth=5;
          //context.strokeStyle='black';
          //context.strokeRect(400, 0, canvas.width, canvas.height);

          ball.x = 300;
          ball.y = 440;
          ball.height = 10;
          ball.width = 0;
          ball.type = 'ball';
          ball.xDelta = 2; //1
          ball.color = '#e6ac00';
          ball.yDelta = -2;

          $('#livecount').html(livecount);
          $('#levelcount').html(currentlevel);
          $('#scorecount').html(scorecount);

          drawbricks();
          drawball();
          drawbr();
          key_start = false;
          key_left = false;
          key_right = false;


      };

      preparelevel();
      initgame();
      animate();








