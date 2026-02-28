module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authorize_request, only: [:register, :login]

      def register
        user = User.new(register_params)

        if user.save
          token = JsonWebToken.encode(user_id: user.id)
          render json: {
            token: token,
            user: user_json(user)
          }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by(email: params[:email]&.downcase&.strip)

        if user&.authenticate(params[:password])
          token = JsonWebToken.encode(user_id: user.id)
          render json: {
            token: token,
            user: user_json(user)
          }
        else
          render json: { error: "Email ou mot de passe incorrect" }, status: :unauthorized
        end
      end

      def me
        render json: { user: user_json(current_user) }
      end

      private

      def register_params
        params.permit(:email, :password, :password_confirmation, :display_name, :village_id).tap do |p|
          p[:email] = p[:email]&.downcase&.strip
        end
      end

      def user_json(user)
        {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          points: user.points,
          village_id: user.village_id,
          village_name: user.village&.name,
          badges: user.badges.map { |b| { slug: b.slug, name: b.name, icon: b.icon } },
          stats: user.stats,
          created_at: user.created_at
        }
      end
    end
  end
end
