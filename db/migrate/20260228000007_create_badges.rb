class CreateBadges < ActiveRecord::Migration[8.1]
  def change
    create_table :badges do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.string :icon
      t.string :criteria_type, null: false
      t.integer :criteria_count, null: false
      t.timestamps
    end

    add_index :badges, :slug, unique: true
  end
end
