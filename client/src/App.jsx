import { Route, Routes } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import MainLayout from "./components/MainLayout"
import Login from "./components/Login"

import Home from "./pages/Home"
import Product from "./pages/Product"
import Cart from "./pages/Cart"
import ListOrder from "./pages/ListOrder"
import ListClient from "./pages/ListClient"
import AdminLayout from "./admin/AdminLayout"
import AdminUsers from "./Admin/AdminUsers"
import AddProduct from "./Admin/AddProduct"
import AddClients from "./Admin/AddClients"
import ListClients from "./Admin/ListClients"
import ListProduct from "./admin/ListProduct"
import EditProduct from "./Admin/EditProduct"
import EditClient from "./admin/EditClient"
import ProductPage from "./pages/ProductPage"
import CreateOrder from "./pages/CreatePreOrder"
import OrderDetails from "./pages/OrderDetails"

const App = () => {

  return (
    <>
      <Toaster />
        <Routes >
          <Route element={<MainLayout />} >
            <Route path='/' element={<Home />} />        
            <Route path='/login' element={<Login />} />        
            <Route path='/products' element={<Product />} />     
            <Route path='/products/:id' element={<ProductPage />} />     
            <Route path='/cart' element={<Cart />} />
            <Route path='/create-order' element={<CreateOrder />} />
            <Route path='/clients' element={<ListClient />} />     
            <Route path='/orders' element={<ListOrder />} />
            <Route path='/orders/:id' element={<OrderDetails />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />} >
            <Route index element={<AddProduct />} />
            <Route path="list-products" element={<ListProduct />} />
            <Route path="edit-product/:id" element={<EditProduct />} />
            <Route path="clients" element={<AddClients />} />
            <Route path="list-clients" element={<ListClients />} />
            <Route path="edit-client/:id" element={<EditClient />} />
            <Route path="register" element={<AdminUsers />} />
          </Route>
        </Routes>
    </>
  )
}

export default App
