class Region < ApplicationRecord
  has_many :villages, dependent: :destroy

  validates :name, presence: true
  validates :code, presence: true, uniqueness: true
  validates :country, presence: true
end
