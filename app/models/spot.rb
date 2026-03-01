class Spot < ApplicationRecord
  belongs_to :village
  belongs_to :creator, class_name: "User"
  belongs_to :planted_by, class_name: "User", optional: true
  has_many :contributions, dependent: :destroy
  has_many :photos, dependent: :destroy

  validates :spot_type, presence: true, inclusion: {
    in: %w[haie_existante haie_potentielle arbre_isole bosquet zone_potentielle]
  }
  validates :geometry_type, presence: true, inclusion: { in: %w[point line polygon] }
  validates :status, presence: true, inclusion: {
    in: %w[brouillon soumis validé planté]
  }
  validates :latitude, presence: true, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }

  TYPES = {
    "haie_existante" => { geometry: "line", label: "Haie existante" },
    "haie_potentielle" => { geometry: "line", label: "Haie potentielle" },
    "arbre_isole" => { geometry: "point", label: "Arbre isolé" },
    "bosquet" => { geometry: "polygon", label: "Bosquet / Verger" },
    "zone_potentielle" => { geometry: "polygon", label: "Zone potentielle" }
  }.freeze

  scope :published, -> { where.not(status: "brouillon") }
  scope :by_village, ->(village_id) { where(village_id: village_id) }
  scope :by_type, ->(type) { where(spot_type: type) }
  scope :by_status, ->(status) { where(status: status) }
  scope :nearby, ->(lat, lng, radius_km) {
    where(
      "SQRT(POW(latitude - ?, 2) + POW((longitude - ?) * COS(RADIANS(?)), 2)) * 111.32 <= ?",
      lat, lng, lat, radius_km
    )
  }

  def submit!
    return unless status == "brouillon"

    update!(status: "soumis")
    creator.add_points!(15)
  end

  def plant!(user)
    return unless status == "validé"

    update!(status: "planté", planted_at: Time.current, planted_by: user)
    user.add_points!(20)
    village.recalculate_score!
  end

  def check_validation!
    return unless status == "soumis"

    if positive_validations >= 2
      update!(status: "validé")
      village.recalculate_score!
    end
  end

  def as_geojson
    {
      type: "Feature",
      geometry: {
        type: geometry_type == "point" ? "Point" : (geometry_type == "line" ? "LineString" : "Polygon"),
        coordinates: geometry_type == "point" ? [longitude, latitude] : (geometry_coords || [longitude, latitude])
      },
      properties: {
        id: id,
        spot_type: spot_type,
        status: status,
        species: species,
        description: description,
        estimated_height: estimated_height,
        is_edible: is_edible,
        opportunity_score: opportunity_score,
        positive_validations: positive_validations,
        creator_name: creator.display_name,
        village_name: village.name,
        photos_count: photos.count,
        created_at: created_at
      }
    }
  end
end
