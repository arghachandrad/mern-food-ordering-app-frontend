import {
  useCreateMyRestaurant,
  useGetMyRestaurant,
  useUpdateMyRestaurant,
} from "@/api/myRestaurantApi"
import ManageRestaurantForm from "@/forms/manage-restaurant-form/ManageRestaurantForm"

function ManageRestaurantPage() {
  const { restaurant } = useGetMyRestaurant()
  const { createRestaurant, isLoading: isCreateLoading } =
    useCreateMyRestaurant()
  const { updateRestaurant, isLoading: isUpdateLoading } =
    useUpdateMyRestaurant()

  const isEditing = !!restaurant

  return (
    <ManageRestaurantForm
      restaurant={restaurant}
      onSave={isEditing ? updateRestaurant : createRestaurant}
      isLoading={isCreateLoading || isUpdateLoading}
    />
  )
}

export default ManageRestaurantPage
