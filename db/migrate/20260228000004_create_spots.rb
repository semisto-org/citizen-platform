class CreateSpots < ActiveRecord::Migration[8.1]
  def change
    create_table :spots do |t|
      t.string :spot_type, null: false
      t.string :geometry_type, null: false, default: "point"
      t.float :latitude, null: false
      t.float :longitude, null: false
      t.json :geometry_coords
      t.string :status, null: false, default: "brouillon"
      t.references :village, null: false, foreign_key: true
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.string :species
      t.float :estimated_height
      t.float :estimated_length
      t.float :estimated_surface
      t.boolean :is_edible
      t.text :description
      t.text :constraints
      t.float :opportunity_score
      t.string :source, default: "citizen"
      t.integer :positive_validations, default: 0, null: false
      t.integer :negative_validations, default: 0, null: false
      t.timestamps
    end

    add_index :spots, :spot_type
    add_index :spots, :status
    add_index :spots, :source
    add_index :spots, [:latitude, :longitude]
  end
end
