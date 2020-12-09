const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')

const axios = require('axios')

const STARWARS_API = 'http://swapi.dev/api/'

app.use(bodyParser.json())

let allPlanets = []
let nextPlanetPage = `${STARWARS_API}planets/?page=1`

let allPeople = []
let nextPeoplePage = `${STARWARS_API}people/?page=1`

const getTenPeople = async () => {
  try {
    const planets = await axios.get(`${nextPeoplePage}`)
    nextPeoplePage = planets.data.next
    allPeople = allPeople.concat(planets.data.results)
  } catch (error) {
    console.error(error)
  }
}

const getAllPeople = async () => {
  await getTenPeople()
  while (typeof nextPeoplePage === 'string' ) {
    await getTenPeople()
  }
  return(allPeople)
}

const getResident = async (res) => {
  try {
    const resident = await axios.get(res)
    return resident.data.name
  } catch (error) {
    console.log(error)
  }
}

const getResidentArray = (littleArray, planet) => {
  planet.residents.map(async(residentLink) => {
    let resident = await getResident(residentLink)
    littleArray = littleArray.concat(resident)
    console.log(littleArray)
    console.log(planet)
    return {...planet, residents: littleArray}
  }) 
}
 
const workPlanetData = (planets) => {
  return (planets.map((planet) => {
    let littleArray = []
    return getResidentArray(littleArray, planet)

  }))
}
// const workPlanetData = (planets) => {
//   return (planets.map( (planet) => {
//     let resArray = planet.residents.map(resident => {getResident(resident)})
//     console.log(resArray)
//     return {...planet, residents: resArray}
//   }))
// }


const getTenPlanets = async () => {
  try {
    let planets = await axios.get(`${nextPlanetPage}`)
    let planetData = workPlanetData(planets.data.results)

    nextPlanetPage = planets.data.next
    allPlanets = allPlanets.concat(planetData)
  } catch (error) {
    console.error(error)
  }
}

const getAllPlanets = async () => {
  await getTenPlanets()
  // while (typeof nextPlanetPage === 'string' ) {
  //   await getTenPlanets()
  // }

  return(allPlanets)
}


getAllPlanets()
getAllPeople()

let sortedPeople = []
sortPeople = (people, sortParam) => {
  // console.log(people, 'sort')
  let newArray = people
  if (sortParam === "name") {
    sortedPeople = newArray.sort((a, b) => (a.name > b.name) ? 1 : -1)
  } else if (sortParam === "height") {
    sortedPeople = newArray.sort(function(a, b){return a.height - b.height})
  } else if (sortParam === "mass") {
    sortedPeople = newArray.sort(function(a, b){return a.mass - b.mass})
  } else {
    sortedPeople = ["invalid search parameter"]
  }
}


app.get('/planets', (req, res) => {
  res.send(allPlanets)
})

app.get('/people', (req, res) => {
  res.send(allPeople)
})

app.get('/people/:sortBy', (req, res) => {
  console.log(req.params.sortBy)
  sortPeople(allPeople, req.params.sortBy)
  res.send(sortedPeople)
})

app.listen(port, () => {
  console.log(`Saved and listening at http://localhost:${port}`)
})