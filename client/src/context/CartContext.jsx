import React, { createContext, useContext, useEffect, useState } from 'react'
import calculateItemDiscount from '../utils/discount';

const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState(()=> {
    const stored = localStorage.getItem("cartItems");
    return stored ? JSON.parse(stored) :  [];
  });

  useEffect(()=> {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const recalculateItem = (item)=> {
    const finalUnitPrice  = calculateItemDiscount(
      item.priceList,
      item.discount1,
      item.discount2,
      item.discount3,
      item.discount4,
    );

    const finalTotalPrice = finalUnitPrice * item.quantity;

    return {
      ...item,
      description: item.description || "",
      finalUnitPrice,
      finalTotalPrice
    };
  };

  const addToCart = (id, name, code, image, quantity, priceList, materialName, structureName, tela = null, description = "") => {
    const newItem = {
      id,
      name,
      code,
      image,
      quantity,
      priceList,
      materialName,
      structureName,
      tela,
      description,
      discount1: 0,
      discount2: 0,
      discount3: 0,
      discount4: 0,
    };

    const calculatedItem = recalculateItem(newItem);
    setCartItems((prev) => [...prev, calculatedItem]);
  };

  // ATUALIZAR QUANTIDADE 
  const updateQuantity = (index, quantity)=> {
    setCartItems(prev => {
      const updated = [...prev];
      updated[index].quantity = Math.max(1, Number(quantity));
      
      updated[index] = recalculateItem(updated[index]);
      return updated;
    });
  };

  // ATUALIZAR DESCONTOS
  const updateDiscount = (index, field, value)=> {
    setCartItems(prev => {
      const updated = [...prev];
      updated[index][field] = Math.max(0, Number(value));

      updated[index] = recalculateItem(updated[index]);
      return updated;
    });
  };

  // REMOVER ITEM
  const removeItem = (index)=> {
    setCartItems(prev => prev.filter((_, i)=> i !== index));
  };

  // LIMPAR CARRINHO
  const clearCart = ()=> {
    setCartItems([]);
    localStorage.removeItem("cartItems");
    localStorage.removeItem("selectedClient");
  };

  // TOTAIS
  const totalWithoutDiscount = cartItems.reduce(
    (sum, item) => sum + item.priceList * item.quantity,
    0
  )

  const totalWithDiscount = cartItems.reduce(
    (sum, item) => sum + item.finalTotalPrice,
    0
  )

  const value = {
        cartItems,
        addToCart,
        updateQuantity,
        updateDiscount,
        removeItem,
        clearCart,
        totalWithoutDiscount,
        totalWithDiscount    
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = ()=> useContext(CartContext)
