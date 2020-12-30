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

// people {
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
let sortedPeople = []
sortPeople = (people, sortParam) => {
  let newArray = people
  if (sortParam === "name") {
    sortedPeople = newArray.sort((a, b) => (a.name > b.name) ? 1 : -1)
  } else if (sortParam === "height") {
    sortedPeople = newArray.sort(function(a, b){return /[A-Za-z]/.test(a.height) - /[A-Za-z]/.test(b.height) || a.height - b.height})

  } else if (sortParam === "mass") {
    sortedPeople = newArray.sort(function(a, b){return /[A-Za-z]/.test(a.mass) - /[A-Za-z]/.test(b.mass) || a.mass.replace(/,/g, '') - b.mass.replace(/,/g, '')})
  } else {
    sortedPeople = ["invalid search parameter"]
  }
}
// } people

// planets {
const getResident = async (resURL) => {
  try {
    const resident = await axios.get(resURL)
    return resident.data.name
  } catch (error) {
    console.log(error, "getResident() Error")
  }
}

const mapPlanets = async () => {
  return await allPlanets.map((planet, planetIndex) => {
    planet.residents.map(async (resident, residentIndex) => {
      allPlanets[planetIndex].residents[residentIndex] = await getResident(resident)
    })
  })
}


const getTenPlanets = async () => {
  try {
    let planets = await axios.get(`${nextPlanetPage}`)
    let planetData = planets.data.results
    nextPlanetPage = planets.data.next
    allPlanets = allPlanets.concat(planetData)
  } catch (error) {
    console.error(error)
  }
}

const getAllPlanets = async () => {
  await getTenPlanets()
  while (typeof nextPlanetPage === 'string' ) {
    await getTenPlanets()
  }
  await mapPlanets()

  return(allPlanets)
}
// } planets


getAllPlanets()
getAllPeople()



app.get('/planets', (req, res) => {
  res.send(allPlanets)
})

app.get('/people', (req, res) => {
  res.send(allPeople)
})

app.get('/people/:sortBy', (req, res) => {
  sortPeople(allPeople, req.params.sortBy)
  res.send(sortedPeople)
})

app.listen(port, () => {
  console.log(`Saved and listening at http://localhost:${port}`)
})