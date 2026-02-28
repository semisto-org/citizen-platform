module Api
  module V1
    class DashboardController < ApplicationController
      skip_before_action :authorize_request, only: [:global]

      def global
        render json: {
          stats: {
            villages_active: Village.where("score > 0").count,
            total_users: User.count,
            total_spots: Spot.published.count,
            spots_validated: Spot.where(status: "validé").count,
            spots_planted: Spot.where(status: "planté").count,
            hectares_planted: Village.sum(:hectares_planted).round(2)
          },
          top_villages: Village.order(score: :desc).limit(10).map { |v|
            { id: v.id, name: v.name, score: v.score, level: v.level, level_name: v.level_name }
          },
          recent_spots: Spot.published.order(created_at: :desc).limit(10).includes(:village, :creator).map { |s|
            { id: s.id, type: s.spot_type, status: s.status, village: s.village.name, creator: s.creator.display_name, created_at: s.created_at }
          }
        }
      end

      def village
        v = Village.find(params[:village_id])
        members = v.users.order(points: :desc).limit(10)

        render json: {
          village: {
            id: v.id,
            name: v.name,
            level: v.level,
            level_name: v.level_name,
            score: v.score,
            hectares_potential: v.hectares_potential,
            hectares_planted: v.hectares_planted,
            members_count: v.users.count,
            active_citizens: v.active_citizens_count,
            spots_total: v.spots.count,
            spots_by_status: v.spots_count_by_status,
            spots_by_type: v.spots.group(:spot_type).count
          },
          leaderboard: members.map { |u|
            { id: u.id, display_name: u.display_name, points: u.points, badges_count: u.badges.count }
          },
          recent_activity: v.spots.order(updated_at: :desc).limit(10).includes(:creator).map { |s|
            { id: s.id, type: s.spot_type, status: s.status, creator: s.creator.display_name, updated_at: s.updated_at }
          }
        }
      end

      def personal
        user = current_user
        render json: {
          user: {
            id: user.id,
            display_name: user.display_name,
            points: user.points,
            role: user.role,
            village_name: user.village&.name
          },
          stats: user.stats,
          badges: user.badges.map { |b| { name: b.name, slug: b.slug, icon: b.icon, description: b.description } },
          recent_contributions: user.contributions.order(created_at: :desc).limit(10).includes(spot: :village).map { |c|
            {
              id: c.id,
              type: c.contribution_type,
              spot_type: c.spot.spot_type,
              village: c.spot.village.name,
              created_at: c.created_at
            }
          }
        }
      end
    end
  end
end
