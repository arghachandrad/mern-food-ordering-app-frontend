import {
  CheckoutSessionRequest,
  useCreateCheckoutSession,
} from "@/api/orderApi"
import { useGetRestaurant } from "@/api/restaurantApi"
import CheckoutButton from "@/components/CheckoutButton"
import MenuItem from "@/components/MenuItem"
import OrderSummary from "@/components/OrderSummary"
import RestaurantInfo from "@/components/RestaurantInfo"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Card, CardFooter } from "@/components/ui/card"
import { UserFormData } from "@/forms/user-profile-form/UserProfileForm"
import { MenuItem as MenuItemType } from "@/types"
import { useState } from "react"
import { useParams } from "react-router-dom"

export type CartItem = {
  _id: string
  name: string
  price: number
  quantity: number
}

export default function DetailPage() {
  const { restaurantId } = useParams()
  const { restaurant, isLoading } = useGetRestaurant(restaurantId)
  const { createCheckoutSession, isLoading: isCheckoutLoading } =
    useCreateCheckoutSession()

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const storagedCartItems = sessionStorage.getItem(
      `cartItems-${restaurantId}`
    )
    return storagedCartItems ? JSON.parse(storagedCartItems) : []
  })

  const addToCart = (menuItem: MenuItemType) => {
    setCartItems((prevCartItems) => {
      // 1. check if the item is already in the cart
      const existingCartItem = prevCartItems.find(
        (cartItem) => cartItem._id === menuItem._id
      )

      let updatedCartItems

      if (existingCartItem) {
        // 2. if in cart then update quantity
        updatedCartItems = prevCartItems.map((cartItem) =>
          cartItem._id === menuItem._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        // 3. if not in cart then add it to the cart
        updatedCartItems = [
          ...prevCartItems,
          {
            _id: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
          },
        ]
      }

      sessionStorage.setItem(
        `cartItems-${restaurantId}`,
        JSON.stringify(updatedCartItems)
      )

      return updatedCartItems
    })
  }

  const removeFromCart = (cartItem: CartItem) => {
    setCartItems((prevCartItems) => {
      const updatedCartItems = prevCartItems.filter(
        (item) => cartItem._id !== item._id
      )

      sessionStorage.setItem(
        `cartItems-${restaurantId}`,
        JSON.stringify(updatedCartItems)
      )

      return updatedCartItems
    })
  }

  const onCheckout = async (userFormData: UserFormData) => {
    if (!restaurant) {
      return
    }

    const checkoutData: CheckoutSessionRequest = {
      cartItems: cartItems.map((cartItem) => ({
        menuItemId: cartItem._id,
        name: cartItem.name,
        quantity: cartItem.quantity.toString(),
      })),
      restaurantId: restaurant?._id,
      deliveryDetails: {
        name: userFormData.name,
        email: userFormData.email as string,
        addressLine1: userFormData.addressLine1,
        city: userFormData.city,
      },
    }

    const data = await createCheckoutSession(checkoutData)
    window.location.href = data.url
  }

  if (isLoading || !restaurant) {
    return <span>Loading...</span>
  }

  return (
    <div className="flex flex-col gap-10">
      <AspectRatio ratio={16 / 5}>
        <img
          src={restaurant.imageUrl}
          alt=""
          className="rounded-md object-cover h-full w-full"
        />
      </AspectRatio>

      <div className="grid md:grid-cols-[4fr_2fr] gap-5 md:px-32">
        <div className="flex flex-col gap-4">
          <RestaurantInfo restaurant={restaurant} />
          <span className="text-2xl font-bold tracking-tight">Menu</span>
          {restaurant.menuItems.map((menuItem) => (
            <MenuItem
              menuItem={menuItem}
              addToCart={() => addToCart(menuItem)}
            />
          ))}
        </div>

        <div>
          <Card>
            <OrderSummary
              restaurant={restaurant}
              cartItems={cartItems}
              removeFromCart={removeFromCart}
            />

            <CardFooter>
              <CheckoutButton
                disabled={cartItems.length === 0}
                onCheckout={onCheckout}
                isLoading={isCheckoutLoading}
              />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
