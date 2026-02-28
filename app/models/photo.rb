class Photo < ApplicationRecord
  belongs_to :spot
  belongs_to :user

  validates :image_url, presence: true

  after_create -> { user.add_points!(3) }
end
