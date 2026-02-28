class User < ApplicationRecord
  has_secure_password

  belongs_to :village, optional: true
  has_many :contributions, dependent: :destroy
  has_many :created_spots, class_name: "Spot", foreign_key: :creator_id, dependent: :nullify
  has_many :photos, dependent: :destroy
  has_many :user_badges, dependent: :destroy
  has_many :badges, through: :user_badges

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :display_name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :role, inclusion: { in: %w[visiteur membre planteur parrain ambassadeur admin] }

  ROLES = %w[visiteur membre planteur parrain ambassadeur admin].freeze

  def add_points!(amount)
    increment!(:points, amount)
    check_badges!
  end

  def stats
    {
      points: points,
      spots_created: created_spots.count,
      validations: contributions.where(contribution_type: "validation").count,
      photos: photos.count,
      badges: badges.pluck(:slug)
    }
  end

  private

  def check_badges!
    Badge.find_each do |badge|
      next if user_badges.exists?(badge: badge)

      earned = case badge.criteria_type
               when "spots_validated"
                 contributions.where(contribution_type: "validation", is_positive: true).count >= badge.criteria_count
               when "spots_created"
                 created_spots.where.not(status: "brouillon").count >= badge.criteria_count
               when "photos_added"
                 photos.count >= badge.criteria_count
               else
                 false
               end

      user_badges.create!(badge: badge) if earned
    end
  end
end
