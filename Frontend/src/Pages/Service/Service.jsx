import React from 'react'
import ServiceOne from '../../Components/ServiceOne/ServiceOne'
import ServiceBreadcrumb from '../../Components/ServiceBreadcrumb/ServiceBreadcrumb'
import ServiceTwo from '../../Components/ServiceTwo/ServiceTwo'
import ServiceThree from '../../Components/ServiceThree/ServiceThree'
import ServiceFour from '../../Components/ServiceFour/ServiceFour'
import ServiceFive from '../../Components/ServiceFive/ServiceFive'

const Service = () => {
  return (
    <div>
        <ServiceBreadcrumb/>
        <ServiceOne/>
        <ServiceTwo/>
        <ServiceThree/>
        <ServiceFour/>
        <ServiceFive/>
    </div>
  )
}

export default Service