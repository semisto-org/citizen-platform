class CreateRegions < ActiveRecord::Migration[8.1]
  def change
    create_table :regions do |t|
      t.string :name, null: false
      t.string :code, null: false
      t.string :country, null: false, default: "BE"
      t.timestamps
    end

    add_index :regions, :code, unique: true
  end
end
