module Api
  module V1
    class VillagesController < ApplicationController
      skip_before_action :authorize_request, only: [:index, :show, :ranking]

      def index
        villages = Village.includes(:region).order(:name)
        villages = villages.where(region_id: params[:region_id]) if params[:region_id]

        if params[:search].present?
          villages = villages.where("name ILIKE ?", "%#{params[:search]}%")
        end

        render json: {
          villages: villages.map { |v| village_summary(v) }
        }
      end

      def show
        village = Village.includes(:region, :spots).find(params[:id])
        render json: { village: village_detail(village) }
      end

      def ranking
        villages = Village.where("score > 0").order(score: :desc).limit(params[:limit] || 50)
        render json: {
          ranking: villages.map.with_index(1) { |v, rank|
            village_summary(v).merge(rank: rank)
          }
        }
      end

      private

      def village_summary(village)
        {
          id: village.id,
          name: village.name,
          code_postal: village.code_postal,
          region: village.region.name,
          latitude: village.latitude,
          longitude: village.longitude,
          level: village.level,
          level_name: village.level_name,
          score: village.score,
          hectares_potential: village.hectares_potential,
          hectares_planted: village.hectares_planted
        }
      end

      def village_detail(village)
        status_counts = village.spots_count_by_status
        village_summary(village).merge(
          population: village.population,
          active_citizens: village.active_citizens_count,
          members_count: village.users.count,
          spots_total: village.spots.count,
          spots_by_status: status_counts,
          spots_by_type: village.spots.group(:spot_type).count,
          recent_activity: village.spots.order(updated_at: :desc).limit(5).map { |s|
            { id: s.id, type: s.spot_type, status: s.status, updated_at: s.updated_at }
          }
        )
      end
    end
  end
end
