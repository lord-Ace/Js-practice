document.addEventListener('DOMContentLoaded', function(){
  const data = document.querySelectorAll('.data')
  const dialog = document.getElementById('dialog')
  const begin = document.getElementById('begin')
  const user = localStorage.getItem('user')//gets the name of the currentuser
  // user data and game info
  let gameData = {
    name: user?.trim() || ' ',
    difficulty: ' ',
    duration : {
     minutes: '0',
     seconds: '10' 
    }
  }

    localStorage.clear()
  if (!user){
    data[0].classList.add('active')
  }else{
    data[1].classList.add('active')
  }
  
  data.forEach((button, index)=>{
    button.addEventListener('submit', function(e){
      e.preventDefault()
      this.classList.remove('active')
      if (index+1 != 3){
      data[index+1].classList.add('active')
      }else{
      dialog.showModal()
      }
      const form = new FormData(this)
      form.forEach((entry)=>{
        console.log(it)
      if(gameData?.[name]){
        gameData[name]=entry
        if(name === 'name'){
          localStorage.setItem('user', entry)
        }
      }else{
        gameData.duration[name]=entry
      }
      })
    })
  })
  
  // const {name, difficulty} = gameData
  // let {minutes, seconds} = gameData.duration
  console.log(name)
  function countDown(){
    seconds --
    gameData.duration.seconds = secs
    if (seconds == 0){
      seconds = 59
      minutes--
    }
    if(seconds == 0 && minutes-- == 0){
      console.log('hurray')
    }
  }
  begin.addEventListener('click', function(){
    dialog.close()
    setInterval(() => {countDown()}, 1000);
  })
})
