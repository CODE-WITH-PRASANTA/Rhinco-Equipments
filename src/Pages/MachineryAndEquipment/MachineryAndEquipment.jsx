import React from 'react'
import MacineryEquipment from '../../Components/MacineryEquipment/MacineryEquipment'
import MacineryEquipmentTable from '../../Components/MacineryEquipmentTable/MacineryEquipmentTable'
import MacineryEquipmentCards from '../../Components/MacineryEquipmentCards/MacineryEquipmentCards'
import MacineryEquipmentQuestions from '../../Components/MacineryEquipmentQuestions/MacineryEquipmentQuestions'

const MachineryAndEquipment = () => {
  return (
    <div>
        <MacineryEquipment/>
        <MacineryEquipmentTable/>
        <MacineryEquipmentCards/>
        <MacineryEquipmentQuestions/>
    </div>
  )
}

export default MachineryAndEquipment