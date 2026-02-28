module Api
  module V1
    class UsersController < ApplicationController
      def update
        if current_user.update(user_params)
          render json: { user: user_json(current_user) }
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def show
        user = User.includes(:village, :badges).find(params[:id])
        render json: { user: public_user_json(user) }
      end

      private

      def user_params
        params.permit(:display_name, :village_id, :bio)
      end

      def user_json(user)
        {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          points: user.points,
          bio: user.bio,
          village_id: user.village_id,
          village_name: user.village&.name,
          badges: user.badges.map { |b| { slug: b.slug, name: b.name, icon: b.icon } },
          stats: user.stats,
          created_at: user.created_at
        }
      end

      def public_user_json(user)
        {
          id: user.id,
          display_name: user.display_name,
          role: user.role,
          points: user.points,
          bio: user.bio,
          village_name: user.village&.name,
          badges: user.badges.map { |b| { slug: b.slug, name: b.name, icon: b.icon } },
          stats: user.stats,
          created_at: user.created_at
        }
      end
    end
  end
end
