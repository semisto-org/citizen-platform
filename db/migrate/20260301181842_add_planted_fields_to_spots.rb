class AddPlantedFieldsToSpots < ActiveRecord::Migration[8.1]
  def change
    add_column :spots, :planted_at, :datetime
    add_reference :spots, :planted_by, foreign_key: { to_table: :users }, null: true
  end
end
