const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const SHOW_URL = BASE_URL + '/posters/'
const movies = []
let filterMovie = []
const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data){
  let rawHTML = ''
  data.forEach( (movie) => {
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${SHOW_URL + movie.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${movie.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id = '${movie.id}'>More</button>
              <button class="btn btn-info btn-add-favorite" data-id = '${movie.id}'>+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(movieCounts){
  const Pages =  Math.ceil(movieCounts / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= Pages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" data-page='${page}' href="#">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML


}


function getMoviesByPage(page){
  const data = filterMovie.length ? filterMovie : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))



const modalTitle = document.querySelector('#movie-modal-title')
const modalImage = document.querySelector('#movie-modal-image')
const modalDate = document.querySelector('#movie-modal-date')
const modalDescription = document.querySelector('#movie-modal-description')

function showMovieModal(id) {
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${SHOW_URL + data.image
        }" alt="movie-poster" class="img-fluid">`
    })
}

function addToFavorites(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('you tired?')
  }
  console.log(list)
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event){
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-add-favorite")){
    addToFavorites(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event){
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmit(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filterMovie = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (!keyword.length){
    return alert('plz enter a valid string')
  }
  if (filterMovie.length === 0){
    return alert(`nothing was found ( keyword : ${keyword} )`)
  }
  renderPaginator(filterMovie.length)
  renderMovieList(getMoviesByPage(1))
})