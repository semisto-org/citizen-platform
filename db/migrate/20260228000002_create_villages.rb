class CreateVillages < ActiveRecord::Migration[8.1]
  def change
    create_table :villages do |t|
      t.string :name, null: false
      t.string :code_postal
      t.references :region, null: false, foreign_key: true
      t.float :latitude
      t.float :longitude
      t.integer :population
      t.integer :level, default: 0, null: false
      t.float :score, default: 0.0, null: false
      t.float :hectares_potential, default: 0.0
      t.float :hectares_planted, default: 0.0
      t.timestamps
    end

    add_index :villages, [:name, :code_postal], unique: true
    add_index :villages, :level
    add_index :villages, :score
  end
end
