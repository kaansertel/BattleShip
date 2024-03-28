document.addEventListener('DOMContentLoaded', () => {
    const userGrid = document.querySelector('.grid-user')
    const computerGrid = document.querySelector('.grid-computer')
    const displayGrid = document.querySelector('.grid-display')
    const ships = document.querySelectorAll('.ship')
    const destroyer = document.querySelector('.destroyer-container')
    const submarine = document.querySelector('.submarine-container')
    const cruiser = document.querySelector('.cruiser-container')
    const battleship = document.querySelector('.battleship-container')
    const carrier = document.querySelector('.carrier-container')
    const startButton = document.querySelector('#start')
    const rotateButton = document.querySelector('#rotate')
    const turnDisplay = document.querySelector('#whose-go')
    const infoDisplay = document.querySelector('#info')
    const startInfoDisplay = document.querySelector('#start-info')
    const setupButtons = document.getElementById('setup-buttons')
    const over = document.getElementById('game-over')
    const userSquares = []
    const tempUserSquares = []
    const computerSquares = []
    let isHorizontal = true
    let isGameOver = false
    let currentPlayer = 'user'
    let shipPlaceCount = 0
    const width = 10 // Genişlik
    const field = width * width; // Alan
    let playerNum = 0
    let ready = false
    let enemyReady = false
    let allShipsPlaced = false
    let shotFired = -1
    let tempReady = false
    let countdown = false;

    //Gemiler
    const shipArray = [
      {
        name: 'destroyer',
        directions: [
          [0, 1],
          [0, width]
        ]
      },
      {
        name: 'submarine',
        directions: [
          [0, 1, 2],
          [0, width, width*2]
        ]
      },
      {
        name: 'cruiser',
        directions: [
          [0, 1, 2],
          [0, width, width*2]
        ]
      },
      {
        name: 'battleship',
        directions: [
          [0, 1, 2, 3],
          [0, width, width*2, width*3]
        ]
      },
      {
        name: 'carrier',
        directions: [
          [0, 1, 2, 3, 4],
          [0, width, width*2, width*3, width*4]
        ]
      },
    ]

    createBoard(userGrid, userSquares)
    createBoard(computerGrid, computerSquares)


    if (gameMode === 'singlePlayer') {
      startSinglePlayer()
    } else {
      startMultiPlayer()
    }

    function startMultiPlayer(){
      const name = document.querySelector('#name').textContent
      var socket = io(name);

      socket.on('connect', () => {
    })
      
      socket.on('player-number', num => {
        playerNum =parseInt(num)
        if (playerNum === 1) {
          currentPlayer = "enemy"
        }
        socket.emit('check-players')
      })

      socket.on('player-connection', num =>{
        playerConnectedOrDisconnected(num)
      })

      socket.on('enemy-ready', num => {
        enemyReady = true
        playerReady(num)
        if (ready) {
           playGameMulti(socket)
           setupButtons.style.display = 'none'
        }
      })

      socket.on('check-players', players => {
        players.forEach((p, i) => {
          if (p.connected) {
            playerConnectedOrDisconnected(i)
          }
          if (p.ready) {
            playerReady(i)
            if (i !== playerReady) {
              enemyReady = true
            }
          }
        })
      })

      startButton.addEventListener('click', () => {
        if (shipPlaceCount >= 17) {
          allShipsPlaced = true
        }
        if(allShipsPlaced) {
          playGameMulti(socket)
        }
        else {
          infoDisplay.innerHTML = "Please place all ships"
        }
      })

      computerSquares.forEach(square => {
        square.addEventListener('click', () => {
          if(currentPlayer === 'user' && ready && enemyReady) {
            shotFired = square.dataset.id
            socket.emit('fire', shotFired)
          }
        })
      })

      socket.on('fire', id => {
        enemyGo(id)
        const square = userSquares[id]
        socket.emit('fire-reply', square.classList)
        playGameMulti(socket)
      })

      socket.on('fire-reply', classList => {
        revealSquareMulti(classList)
        playGameMulti(socket)
      })

      socket.on('check-ready', num =>{
        let player = `.p${parseInt(num) + 1}`
        if (tempReady) {
          document.querySelector(`${player} .ready`).classList.toggle('active')
        }
      })
      
      socket.on('player-continue', () => {
        if (isGameOver === false && allShipsPlaced === true && ready === true && enemyReady === true ) {
          window.location.reload()
        }
      })
      

      function playerConnectedOrDisconnected(num) {
        let player = `.p${parseInt(num) + 1}`
        document.querySelector(`${player} .connected`).classList.toggle('active')
        if(parseInt(num) === playerNum) {
          document.querySelector(player).style.fontWeight = 'bold'
        } 
      }

    }

    function playerReady(num) {
      let player = `.p${parseInt(num) + 1}`
      document.querySelector(`${player} .ready`).classList.toggle('active')
      tempReady = true
    }

    function startSinglePlayer() {
      generate(shipArray[0])
      generate(shipArray[1])
      generate(shipArray[2])
      generate(shipArray[3])
      generate(shipArray[4])

      startButton.addEventListener('click', () => {
        playGame()
      })
    }

    //Masa oluşturma
    function createBoard(grid, squares){
        for (let i = 0; i < field; i++) {
            const square = document.createElement('div')
            square.dataset.id = i
            grid.appendChild(square)
            squares.push(square)
            tempUserSquares[i] = 0
        }
    }

      //Gemileri rastgele yerleştirme
      function generate(ship) {
        let randomDirection = Math.floor(Math.random() * ship.directions.length)
        let current = ship.directions[randomDirection]
        if(randomDirection === 0){
            direction = 1;
        }
        if (randomDirection === 1) {
            direction = 10;
        }

        let randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)))

        const isTaken = current.some(index => computerSquares[randomStart + index].classList.contains('taken'))
        const isAtRightEdge = current.some(index => (randomStart + index) % width === width -1)
        const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0)

        if (!isTaken && !isAtRightEdge && !isAtLeftEdge) {
            current.forEach(index => computerSquares[randomStart + index].classList.add('taken', ship.name))
        }
        else {
            generate(ship)
        }
      }

      // Gemileri döndürme
      function rotate() {
        if (isHorizontal) {
            destroyer.classList.toggle('destroyer-container-vertical')
            submarine.classList.toggle('submarine-container-vertical')
            cruiser.classList.toggle('cruiser-container-vertical')
            battleship.classList.toggle('battleship-container-vertical')
            carrier.classList.toggle('carrier-container-vertical')
            isHorizontal = false
            return   
        }
        if (!isHorizontal) {
            destroyer.classList.toggle('destroyer-container-vertical')
            submarine.classList.toggle('submarine-container-vertical')
            cruiser.classList.toggle('cruiser-container-vertical')
            battleship.classList.toggle('battleship-container-vertical')
            carrier.classList.toggle('carrier-container-vertical')
            isHorizontal = true
            return
        }
      }

      rotateButton.addEventListener('click', rotate)

      //Gemileri hareket ettirme
      ships.forEach(ship => ship.addEventListener('dragstart' , dragStart))
      userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
      userSquares.forEach(square => square.addEventListener('dragover', dragOver))
      userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
      userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
      userSquares.forEach(square => square.addEventListener('drop', dragDrop))
      userSquares.forEach(square => square.addEventListener('dragend', dragEnd))

      let selectedShipNameWithIndex
      let draggedShip
      let draggedShipLength

      ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
        selectedShipNameWithIndex = e.target.id
      }))

      function dragStart() {
        draggedShip = this
        draggedShipLength = this.childNodes.length
      }

      function dragOver(e) {
        e.preventDefault()
      }
    
      function dragEnter(e) {
        e.preventDefault()
      }
    
      function dragLeave() {
        //console.log('drag leave')
      }

      function dragDrop() {
        let temp = true;
        let shipNameWithLastId = draggedShip.lastChild.id
        let shipClass = shipNameWithLastId.slice(0, -2)
        let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
        let shipLastId = lastShipIndex + parseInt(this.dataset.id)

        const notAllowedHorizontal = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,22,32,42,52,62,72,82,92]
        const notAllowedVertical = [99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60]

        let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex)
        //let newNotAllowedVertical = notAllowedVertical.splice(0, 10 * lastShipIndex)

        selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))
        
        shipLastId = shipLastId - selectedShipIndex
 
        let tempHorizontal = parseInt((parseInt(this.dataset.id) - selectedShipIndex) / 10)
        if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) {
            for (let i = 0; i < draggedShipLength; i++){
                if (tempUserSquares[parseInt(this.dataset.id) - selectedShipIndex + i] === 0 && tempHorizontal === parseInt((parseInt(this.dataset.id) - selectedShipIndex + i) / 10) ) {
                    temp = false;
                } else {
                    temp = true;
                    break;
                }    
            }
            for (let i = 0; i < draggedShipLength; i++){
                if (temp == false) {
                  let directionClass
                  if (i === 0){
                    directionClass = 'start'
                  } 
                  if (i === draggedShipLength - 1) {
                    directionClass = 'end'
                  }
                    userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', 'horizontal', directionClass, shipClass)
                    tempUserSquares[parseInt(this.dataset.id) - selectedShipIndex + i] = 1
                    shipPlaceCount++
                }
            }
            if (temp == false) {
                displayGrid.removeChild(draggedShip)
            }

          // Sürüklenen geminin indeksi kabul edilen bölge içinde olmadığı sürece displayGrid'e geri dönecektir.
        } else if (!isHorizontal) {
            for (let i = 0; i < draggedShipLength; i++){
                if (tempUserSquares[parseInt(this.dataset.id) - selectedShipIndex * width + width * i] === 0) {
                    temp = false;
                } else {
                    temp = true;
                    break;
                }    
            }
            for (let i = 0; i < draggedShipLength; i++){
                if (temp == false) {
                  let directionClass
                  if (i === 0){
                    directionClass = 'start'
                  } 
                  if (i === draggedShipLength - 1) {
                    directionClass = 'end'
                  }
                    userSquares[parseInt(this.dataset.id) - selectedShipIndex * width + width * i].classList.add('taken', 'vertical', directionClass, shipClass)
                    tempUserSquares[parseInt(this.dataset.id) - selectedShipIndex * width + width * i] = 1
                    shipPlaceCount++
                }
            }
            if (temp == false) {
                displayGrid.removeChild(draggedShip)
            }
            rotate()
        } else return

        //displayGrid.removeChild(draggedShip)
      }

      function dragEnd() {
        console.log('End')
      }

      function playGameMulti(socket) {
        setupButtons.style.display = 'none'
        if(isGameOver) return
        if(!ready) {
          socket.emit('player-ready')
          ready = true
          playerReady(playerNum)
        }
    
        if(enemyReady) {
          if(currentPlayer === 'user') {
            turnDisplay.innerHTML = 'Your Go'
          }
          if(currentPlayer === 'enemy') {
            turnDisplay.innerHTML = "Enemy's Go"
          }
        }
      }

      //Oynayış
      function playGame() {
        if (shipPlaceCount >= 17) {
          startInfoDisplay.innerHTML = 'Game Has Started'
          setTimeout(hiddenInfo, 2000)
          setupButtons.style.display = 'none'
          if (!isGameOver) {
            if (currentPlayer === 'computer') {
              turnDisplay.innerHTML = 'Computers Turn'
              setTimeout(computerGo, 1500)
            }
            if (currentPlayer === 'user') {
              turnDisplay.innerHTML = 'Your Turn'
              computerSquares.forEach(square => square.addEventListener('click', function(e){
                return revealSquare(square)
              }))
            }
          } else {
            startButton.removeEventListener('click', playGame)
          }
        } else {
          startInfoDisplay.innerHTML = 'Please place all ships'
        }
      }

      //startButton.addEventListener('click', playGame)


      let destroyerCount = 0
      let submarineCount = 0
      let cruiserCount = 0
      let battleshipCount = 0
      let carrierCount = 0

      function revealSquare(square) {
        if (!isGameOver && currentPlayer === 'user') {
          if (!square.classList.contains('boom') && !square.classList.contains('miss')) {
            if (square.classList.contains('destroyer')) {
              destroyerCount++
              square.classList.add('boom')
              fireSound()
              checkForWins()
              return
            }
            else if (square.classList.contains('submarine')) {
              submarineCount++
              square.classList.add('boom')
              fireSound()
              checkForWins()
              return
            }
            else if (square.classList.contains('cruiser')) {
              cruiserCount++
              square.classList.add('boom')
              fireSound()
              checkForWins()
              return
            }
            else if (square.classList.contains('battleship')) {
              battleshipCount++
              square.classList.add('boom')
              fireSound()
              checkForWins()
              return
            }
            else if (square.classList.contains('carrier')) {
              carrierCount++
              square.classList.add('boom')
              fireSound()
              checkForWins()
              return
            } else {
              square.classList.add('miss')
              missSound();
              currentPlayer = 'computer'
            }
          } else {
              return
          }
        checkForWins()
        //setTimeout(playGame, 1000)
        playGame()
        }
      }

      function revealSquareMulti(classList) {
        const enemySquare = computerGrid.querySelector(`div[data-id='${shotFired}']`)
        const obj = Object.values(classList)
        if (!enemySquare.classList.contains('boom') && !enemySquare.classList.contains('miss') && currentPlayer === 'user' && !isGameOver) {
          if (obj.includes('destroyer')) destroyerCount++
          if (obj.includes('submarine')) submarineCount++
          if (obj.includes('cruiser')) cruiserCount++
          if (obj.includes('battleship')) battleshipCount++
          if (obj.includes('carrier')) carrierCount++
        }
        if (obj.includes('taken') && !enemySquare.classList.contains('boom')) {
          enemySquare.classList.add('boom')
          fireSound()
          currentPlayer = 'user'
        } else if (!enemySquare.classList.contains('miss') && !enemySquare.classList.contains('boom')) {
          enemySquare.classList.add('miss')
          missSound()
          currentPlayer = 'enemy'
        }
        checkForWins()
      }

      let cpuDestroyerCount = 0
      let cpuSubmarineCount = 0
      let cpuCruiserCount = 0
      let cpuBattleshipCount = 0
      let cpuCarrierCount = 0

      function computerGo() {
        let random = Math.floor(Math.random() * userSquares.length)

        if (!userSquares[random].classList.contains('boom') && !userSquares[random].classList.contains('miss') ) {
          if (userSquares[random].classList.contains('destroyer')) {
            userSquares[random].classList.add('boom')
            cpuDestroyerCount++
            fireSound()
            checkForWins()
            playGame()
          }
          else if (userSquares[random].classList.contains('submarine')) {
            userSquares[random].classList.add('boom')
            cpuSubmarineCount++
            fireSound()
            checkForWins()
            playGame()
          }
          else if (userSquares[random].classList.contains('cruiser')) {
            userSquares[random].classList.add('boom')
            cpuCruiserCount++
            fireSound()
            checkForWins()
            playGame()
          }
          else if (userSquares[random].classList.contains('battleship')) {
            userSquares[random].classList.add('boom')
            cpuBattleshipCount++
            fireSound()
            checkForWins()
            playGame()
          }
          else if (userSquares[random].classList.contains('carrier')) {
            userSquares[random].classList.add('boom')
            cpuCarrierCount++
            fireSound()
            checkForWins()
            playGame()
          } else {
            userSquares[random].classList.add('miss')
            missSound();
            currentPlayer = 'user'
            turnDisplay.innerHTML = 'Your Turn'
            playGame()
          }
          checkForWins()
        }else {
          computerGo()
        }
      }


      function enemyGo(square) {
        if (!userSquares[square].classList.contains('boom') && !userSquares[square].classList.contains('miss') ) {
          if (userSquares[square].classList.contains('destroyer')) {
            userSquares[square].classList.add('boom')
            fireSound()
            cpuDestroyerCount++
            checkForWins()
            //playGame()
          }
          else if (userSquares[square].classList.contains('submarine')) {
            userSquares[square].classList.add('boom')
            fireSound()
            cpuSubmarineCount++
            checkForWins()
            //playGame()
          }
          else if (userSquares[square].classList.contains('cruiser')) {
            userSquares[square].classList.add('boom')
            fireSound()
            cpuCruiserCount++
            checkForWins()
            //playGame()
          }
          else if (userSquares[square].classList.contains('battleship')) {
            userSquares[square].classList.add('boom')
            fireSound()
            cpuBattleshipCount++
            checkForWins()
            //playGame()
          }
          else if (userSquares[square].classList.contains('carrier')) {
            userSquares[square].classList.add('boom')
            fireSound()
            cpuCarrierCount++
            checkForWins()
            //playGame()
          } else {
            userSquares[square].classList.add('miss')
            missSound()
            currentPlayer = 'user'
            turnDisplay.innerHTML = 'Your Turn'
            //playGame()
          }
          checkForWins()
        }else {
          //computerGo()
        }
      }

      function checkForWins() {
        let name = 'computer'
        if (gameMode === 'multiPlayer') {
          name = 'enemy'
        }
        if (destroyerCount === 2) {
          infoDisplay.innerHTML = `You sunk the ${name}'s Destroyer`
          destroyerCount = 10
        }
        if (submarineCount === 3) {
          infoDisplay.innerHTML = `You sunk the ${name}'s Submarine`
          submarineCount = 10
        }
        if (cruiserCount === 3) {
          infoDisplay.innerHTML = `You sunk the ${name}'s Cruiser`
          cruiserCount = 10
        }
        if (battleshipCount === 4) {
          infoDisplay.innerHTML = `You sunk the ${name}'s Battleship` 
          battleshipCount = 10
        }
        if (carrierCount === 5) {
          infoDisplay.innerHTML = `You sunk the ${name}'s Carrier` 
          carrierCount = 10
        }
        if (cpuDestroyerCount === 2) {
          infoDisplay.innerHTML = `The ${name} sunk your Destroyer`
          cpuDestroyerCount = 10
        }
        if (cpuSubmarineCount === 3) {
          infoDisplay.innerHTML = `The ${name} sunk your Submarine`
          cpuSubmarineCount = 10
        }
        if (cpuCruiserCount === 3) {
          infoDisplay.innerHTML = `The ${name} sunk your Cruiser`
          cpuCruiserCount = 10
        }
        if (cpuBattleshipCount === 4) {
          infoDisplay.innerHTML = `The ${name} sunk your Battleship`
          cpuBattleshipCount = 10
        }
        if (cpuCarrierCount === 5) {
          infoDisplay.innerHTML = `The ${name} sunk your Carrier`
          cpuCarrierCount = 10
        }

        if ( (destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) === 50 ) {
          turnDisplay.style.display = "none";
          infoDisplay.innerHTML = "YOU WIN"
          winSound()
          gameOver()
        }
        if ((cpuDestroyerCount + cpuSubmarineCount + cpuCruiserCount + cpuBattleshipCount + cpuCarrierCount) === 50) {
          turnDisplay.style.display = "none";
          infoDisplay.innerHTML = `${name.toUpperCase()} WINS`
          loseSound()
          gameOver()
        }

        return
      }
      
      function gameOver() {
        var time = 10
        isGameOver = true
        startButton.removeEventListener('click', playGame)
        if (gameMode === 'multiPlayer') {
          currentPlayer = 'none'
          over.style.display = ""
          setInterval(() => {
            time--;
            document.getElementById("countdown").innerHTML = time;
          }, 1000);
          setTimeout(goLobby, 10000);
        }
      }

      function goLobby() {
        window.location.assign("./rooms")
      }

      function hiddenInfo() {
        startInfoDisplay.style.display = "none"
      }

      function missSound() {
        new Audio('./effects/Water.mp3').play()
      }

      function fireSound() {
        new Audio('./effects/Fire.mp3').play()
      }

      function winSound() {
        new Audio('./effects/Win.mp3').play()
      }

      function loseSound() {
        new Audio('./effects/GameOver.mp3').play()
      }
})
