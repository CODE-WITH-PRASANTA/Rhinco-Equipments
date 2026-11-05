import React from 'react'
import HeroSection from '../../Components/HeroSection/HeroSection'
import BrowsbyCategory from '../../Components/BrowsbyCategory/BrowsbyCategory'
import AgriMachinery from '../../Components/AgriMachinery/AgriMachinery'

const Home = () => {
  return (
    <div>
        <HeroSection />
        <BrowsbyCategory />
        <AgriMachinery />
    </div>
  )
}

export default Home