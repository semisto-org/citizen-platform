class Badge < ApplicationRecord
  has_many :user_badges, dependent: :destroy
  has_many :users, through: :user_badges

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :criteria_type, presence: true
  validates :criteria_count, presence: true, numericality: { greater_than: 0 }
end
