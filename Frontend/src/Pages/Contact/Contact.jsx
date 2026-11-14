import React from 'react'
import ContactOne from '../../Components/ContactOne/ContactOne'

import ContactBreadcrumb from '../../Components/ContactBreadcrumb/ContactBreadcrumb'
import ContactTwo from '../../Components/ContactTwo/ContactTwo'


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