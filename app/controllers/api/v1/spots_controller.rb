module Api
  module V1
    class SpotsController < ApplicationController
      skip_before_action :authorize_request, only: [:index, :show, :geojson]

      def index
        spots = Spot.published.includes(:village, :creator)

        spots = spots.by_village(params[:village_id]) if params[:village_id]
        spots = spots.by_type(params[:type]) if params[:type]
        spots = spots.by_status(params[:status]) if params[:status]

        if params[:lat] && params[:lng] && params[:radius]
          spots = spots.nearby(params[:lat].to_f, params[:lng].to_f, params[:radius].to_f)
        end

        spots = spots.order(created_at: :desc).limit(params[:limit] || 100)

        render json: { spots: spots.map { |s| spot_json(s) } }
      end

      def geojson
        spots = Spot.published.includes(:village, :creator, :photos)

        spots = spots.by_village(params[:village_id]) if params[:village_id]
        spots = spots.by_type(params[:type]) if params[:type]
        spots = spots.by_status(params[:status]) if params[:status]

        render json: {
          type: "FeatureCollection",
          features: spots.map(&:as_geojson)
        }
      end

      def show
        spot = Spot.includes(:village, :creator, :photos, :contributions).find(params[:id])
        render json: { spot: spot_detail(spot) }
      end

      def create
        spot = current_user.created_spots.build(spot_params)
        spot.village = current_user.village unless spot.village_id

        if spot.save
          render json: { spot: spot_json(spot) }, status: :created
        else
          render json: { errors: spot.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        spot = Spot.find(params[:id])

        unless spot.creator_id == current_user.id || current_user.role.in?(%w[ambassadeur admin])
          return render json: { error: "Non autorisé" }, status: :forbidden
        end

        if spot.update(spot_params)
          render json: { spot: spot_json(spot) }
        else
          render json: { errors: spot.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def submit
        spot = Spot.find(params[:id])

        unless spot.creator_id == current_user.id
          return render json: { error: "Non autorisé" }, status: :forbidden
        end

        spot.submit!
        render json: { spot: spot_json(spot) }
      end

      def validate
        spot = Spot.find(params[:id])

        if spot.creator_id == current_user.id
          return render json: { error: "Vous ne pouvez pas valider votre propre spot" }, status: :forbidden
        end

        contribution = Contribution.new(
          user: current_user,
          spot: spot,
          contribution_type: "validation",
          is_positive: params[:is_positive],
          comment: params[:comment]
        )

        if contribution.save
          render json: { spot: spot_json(spot.reload), contribution: contribution.as_json }
        else
          render json: { errors: contribution.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def plant
        spot = Spot.find(params[:id])

        unless spot.status == "validé"
          return render json: { error: "Seul un spot validé peut être marqué comme planté" }, status: :unprocessable_entity
        end

        spot.plant!(current_user)
        render json: { spot: spot_json(spot) }
      end

      def report
        spot = Spot.find(params[:id])

        contribution = Contribution.new(
          user: current_user,
          spot: spot,
          contribution_type: "signalement",
          comment: params[:comment]
        )

        if contribution.save
          render json: { message: "Signalement enregistré" }
        else
          render json: { errors: contribution.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def spot_params
        params.permit(
          :spot_type, :geometry_type, :latitude, :longitude,
          :species, :estimated_height, :estimated_length, :estimated_surface,
          :is_edible, :description, :constraints, :village_id,
          geometry_coords: []
        )
      end

      def spot_json(spot)
        {
          id: spot.id,
          spot_type: spot.spot_type,
          geometry_type: spot.geometry_type,
          latitude: spot.latitude,
          longitude: spot.longitude,
          status: spot.status,
          species: spot.species,
          description: spot.description,
          estimated_height: spot.estimated_height,
          is_edible: spot.is_edible,
          opportunity_score: spot.opportunity_score,
          source: spot.source,
          positive_validations: spot.positive_validations,
          negative_validations: spot.negative_validations,
          village_id: spot.village_id,
          village_name: spot.village.name,
          creator_name: spot.creator.display_name,
          photos_count: spot.photos.size,
          created_at: spot.created_at,
          updated_at: spot.updated_at
        }
      end

      def spot_detail(spot)
        spot_json(spot).merge(
          geometry_coords: spot.geometry_coords,
          constraints: spot.constraints,
          estimated_length: spot.estimated_length,
          estimated_surface: spot.estimated_surface,
          photos: spot.photos.map { |p| { id: p.id, url: p.image_url, caption: p.caption } },
          contributions: spot.contributions.includes(:user).order(created_at: :desc).map { |c|
            {
              id: c.id,
              type: c.contribution_type,
              is_positive: c.is_positive,
              comment: c.comment,
              user_name: c.user.display_name,
              created_at: c.created_at
            }
          }
        )
      end
    end
  end
end
