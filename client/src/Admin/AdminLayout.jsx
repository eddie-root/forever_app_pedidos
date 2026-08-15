import React, { useContext } from 'react'
import toast from 'react-hot-toast';
import GlobalContext from '../../context/GlobalContext';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { assets } from '../../assets/assets';
import api from '../../utils/api';

const AdminLayout = () => {

    const { navigate } = useContext(GlobalContext);

    const sidebarLinks = [
        { name: 'Add Product', path: '/admin', icon: assets.add_icon },
        { name: 'Product List', path: '/admin/product-list', icon: assets.product_list_icon },
        { name: 'Add Client', path: '/admin/add-client', icon: assets.add_icon },
        { name: 'List Client', path: '/admin/list-client', icon: assets.product_list_icon },
        { name: 'List Orders', path: '/admin/list-orders', icon: assets.product_list_icon },
    ]

    const logout = async ()=> {
        try {
            const { data } = await api.get('/api/admin/logout')
            if (data.success) {
                toast.success(data.message)
                setTimeout(() => {
                    navigate('/');
                }, 100);
                                
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

  return (
    <>
        <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-400 py-3 bg-white'>
            <Link to='/'>
                <img src={assets.logo} alt="logo" className='cursor-pointer w-54'/>
            </Link>
            <div className='flex items-center gap-5 text-gray-500'>
                <p>Hi! Admin</p>
                <button onClick={logout} className='border rounded-full text-sm px-4 py-1 cursor-pointer'>Logout</button>
            </div>
        </div>
        <div className='flex'>
            <div className='md:w-64 w-16 border-r-h[95wh] text-base border-gray-400 pt-4 flex flex-col transition-all duration-300' >
                {sidebarLinks.map((item)=> (
                    <NavLink 
                        to={item.path}
                        key={item.name}
                        end={item.path === '/admin'}
                        className={({ isActive })=> `flex items-center py-3 px-4 gap-3 ${isActive ? 'border-r-4 md:border-r-[6px] bg-primary/30 border-primary text-primary' : 'hover:bg-gray-200/90 border-white'}`}
                    >
                        <img src={item.icon} alt="" className='w-7 h-7'/>
                        <p className='md:block hidden text-center'>{item.name}</p>
                    </NavLink>
                ))}
            </div>
            <Outlet />
        </div>
    </>
  )
}

export default AdminLayout
