class Village < ApplicationRecord
  belongs_to :region
  has_many :users, dependent: :nullify
  has_many :spots, dependent: :destroy

  validates :name, presence: true
  validates :level, inclusion: { in: 0..5 }

  LEVELS = {
    0 => nil,
    1 => "Village en éveil",
    2 => "Village planteur",
    3 => "Village nourricier",
    4 => "Village résilient",
    5 => "Village modèle"
  }.freeze

  def level_name
    LEVELS[level]
  end

  def active_citizens_count
    users.where("updated_at > ?", 30.days.ago).count
  end

  def spots_count_by_status
    spots.group(:status).count
  end

  def recalculate_score!
    total = 0.0
    total += (hectares_potential > 0 ? [hectares_potential / 100.0, 1.0].min : 0) * 15
    total += (hectares_potential > 0 ? (hectares_planted / hectares_potential) : 0) * 25
    total += (active_citizens_count.to_f / [population || 1, 1].max) * 15 * 100
    recent_actions = spots.where("updated_at > ?", 30.days.ago).count +
                     Contribution.joins(:spot).where(spots: { village_id: id }).where("contributions.created_at > ?", 30.days.ago).count
    total += [recent_actions / 50.0, 1.0].min * 15

    update!(
      score: total.round(2),
      level: calculate_level
    )
  end

  private

  def calculate_level
    validated_spots = spots.where(status: "validé").count
    planted_spots = spots.where(status: "planté").count

    if hectares_planted >= 3
      4
    elsif hectares_planted >= 1
      3
    elsif planted_spots >= 1
      2
    elsif validated_spots >= 5
      1
    else
      0
    end
  end
end
