import React from 'react'
import ContactOne from '../../Components/ContactOne/ContactOne'

import ContactBreadcrumb from '../../Components/ContactBreadcrumb/ContactBreadcrumb'
import ContactTwo from '../../Components/Contacttwo/Contacttwo'


const Contact = () => {
  return (
    <div>
        <ContactBreadcrumb/>
        <ContactOne/>
        <ContactTwo/>
    </div>
  )
}

export default Contact