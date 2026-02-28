class CreateContributions < ActiveRecord::Migration[8.1]
  def change
    create_table :contributions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :spot, null: false, foreign_key: true
      t.string :contribution_type, null: false
      t.boolean :is_positive
      t.text :comment
      t.json :changes_data
      t.timestamps
    end

    add_index :contributions, :contribution_type
    add_index :contributions, [:user_id, :spot_id, :contribution_type], unique: true, name: "idx_unique_user_spot_contribution"
  end
end
