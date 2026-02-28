Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Authentication
      post "auth/register", to: "auth#register"
      post "auth/login", to: "auth#login"
      get "auth/me", to: "auth#me"

      # Users
      get "users/:id", to: "users#show"
      patch "users/me", to: "users#update"

      # Villages
      resources :villages, only: [:index, :show]
      get "villages-ranking", to: "villages#ranking"

      # Spots
      resources :spots, only: [:index, :show, :create, :update] do
        member do
          post :submit
          post :validate
          post :report
        end
      end
      get "spots-geojson", to: "spots#geojson"

      # Dashboard
      get "dashboard/global", to: "dashboard#global"
      get "dashboard/village/:village_id", to: "dashboard#village"
      get "dashboard/personal", to: "dashboard#personal"
    end
  end
end
