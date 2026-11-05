import React from 'react'
import PDetailsBreadcrumb from '../../Components/PDetailsBreadcrumb/PDetailsBreadcrumb'
import ProductDetailsOne from '../../Components/ProductDetailsOne/ProductDetailsOne'
import ProductDetailsTwo from '../../Components/ProductDetailsTwo/ProductDetailsTwo'

const ProductDetails = () => {
  return (
    <div>
       <PDetailsBreadcrumb /> 
       <ProductDetailsOne />
       <ProductDetailsTwo />

    </div>
  )
}

export default ProductDetails