class Contribution < ApplicationRecord
  belongs_to :user
  belongs_to :spot

  validates :contribution_type, presence: true, inclusion: {
    in: %w[validation correction signalement]
  }

  after_create :process_contribution

  private

  def process_contribution
    case contribution_type
    when "validation"
      if is_positive
        spot.increment!(:positive_validations)
      else
        spot.increment!(:negative_validations)
      end
      spot.check_validation!
      user.add_points!(5)
    when "correction"
      user.add_points!(5)
    when "signalement"
      user.add_points!(2)
    end
  end
end
