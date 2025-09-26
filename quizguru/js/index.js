document.addEventListener('DOMContentLoaded', function(){
  const stage = document.querySelectorAll('.stage')
  const next = document.querySelectorAll('.continue')
  const dialog = document.getElementById('dialog')
  const user = localStorage.getItem('user')//gets the name of the currentuser

    // localStorage.clear()
// localStorage.setItem('user', 'blu')
  if (user == '' || user == null){
    stage[0].classList.add('active')
    console.log(`no current user`)
  }else{
    console.log(user)
    dialog.showModal()
    stage[1].classList.add('active')
  }
  
  next.forEach(button=>{
    button.addEventListener('click', function(){
      const previous = this.previousElementSibling
      console.log(this.getAttribute('id'))
    })
  })
})