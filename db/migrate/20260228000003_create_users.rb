class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :display_name, null: false
      t.string :role, null: false, default: "membre"
      t.references :village, foreign_key: true
      t.integer :points, default: 0, null: false
      t.text :bio
      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :role
    add_index :users, :points
  end
end
