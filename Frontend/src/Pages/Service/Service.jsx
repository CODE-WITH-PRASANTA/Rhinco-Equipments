import React from 'react'
import ServiceOne from '../../Components/ServiceOne/ServiceOne'
import ServiceBreadcrumb from '../../Components/ServiceBreadcrumb/ServiceBreadcrumb'
import ServiceTwo from '../../Components/ServiceTwo/ServiceTwo'
import ServiceThree from '../../Components/ServiceThree/ServiceThree'

const Service = () => {
  return (
    <div>
        <ServiceBreadcrumb/>
        <ServiceOne/>
        <ServiceTwo/>
        <ServiceThree/>
    </div>
  )
}

export default Service