# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_01_181842) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "badges", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "criteria_count", null: false
    t.string "criteria_type", null: false
    t.text "description"
    t.string "icon"
    t.string "name", null: false
    t.string "slug", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_badges_on_slug", unique: true
  end

  create_table "contributions", force: :cascade do |t|
    t.json "changes_data"
    t.text "comment"
    t.string "contribution_type", null: false
    t.datetime "created_at", null: false
    t.boolean "is_positive"
    t.bigint "spot_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["contribution_type"], name: "index_contributions_on_contribution_type"
    t.index ["spot_id"], name: "index_contributions_on_spot_id"
    t.index ["user_id", "spot_id", "contribution_type"], name: "idx_unique_user_spot_contribution", unique: true
    t.index ["user_id"], name: "index_contributions_on_user_id"
  end

  create_table "photos", force: :cascade do |t|
    t.string "caption"
    t.datetime "created_at", null: false
    t.string "image_url", null: false
    t.bigint "spot_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["spot_id"], name: "index_photos_on_spot_id"
    t.index ["user_id"], name: "index_photos_on_user_id"
  end

  create_table "regions", force: :cascade do |t|
    t.string "code", null: false
    t.string "country", default: "BE", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_regions_on_code", unique: true
  end

  create_table "spots", force: :cascade do |t|
    t.text "constraints"
    t.datetime "created_at", null: false
    t.bigint "creator_id", null: false
    t.text "description"
    t.float "estimated_height"
    t.float "estimated_length"
    t.float "estimated_surface"
    t.json "geometry_coords"
    t.string "geometry_type", default: "point", null: false
    t.boolean "is_edible"
    t.float "latitude", null: false
    t.float "longitude", null: false
    t.integer "negative_validations", default: 0, null: false
    t.float "opportunity_score"
    t.datetime "planted_at"
    t.bigint "planted_by_id"
    t.integer "positive_validations", default: 0, null: false
    t.string "source", default: "citizen"
    t.string "species"
    t.string "spot_type", null: false
    t.string "status", default: "brouillon", null: false
    t.datetime "updated_at", null: false
    t.bigint "village_id", null: false
    t.index ["creator_id"], name: "index_spots_on_creator_id"
    t.index ["latitude", "longitude"], name: "index_spots_on_latitude_and_longitude"
    t.index ["planted_by_id"], name: "index_spots_on_planted_by_id"
    t.index ["source"], name: "index_spots_on_source"
    t.index ["spot_type"], name: "index_spots_on_spot_type"
    t.index ["status"], name: "index_spots_on_status"
    t.index ["village_id"], name: "index_spots_on_village_id"
  end

  create_table "user_badges", force: :cascade do |t|
    t.bigint "badge_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["badge_id"], name: "index_user_badges_on_badge_id"
    t.index ["user_id", "badge_id"], name: "index_user_badges_on_user_id_and_badge_id", unique: true
    t.index ["user_id"], name: "index_user_badges_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.text "bio"
    t.datetime "created_at", null: false
    t.string "display_name", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.integer "points", default: 0, null: false
    t.string "role", default: "membre", null: false
    t.datetime "updated_at", null: false
    t.bigint "village_id"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["points"], name: "index_users_on_points"
    t.index ["role"], name: "index_users_on_role"
    t.index ["village_id"], name: "index_users_on_village_id"
  end

  create_table "villages", force: :cascade do |t|
    t.string "code_postal"
    t.datetime "created_at", null: false
    t.float "hectares_planted", default: 0.0
    t.float "hectares_potential", default: 0.0
    t.float "latitude"
    t.integer "level", default: 0, null: false
    t.float "longitude"
    t.string "name", null: false
    t.integer "population"
    t.bigint "region_id", null: false
    t.float "score", default: 0.0, null: false
    t.datetime "updated_at", null: false
    t.index ["level"], name: "index_villages_on_level"
    t.index ["name", "code_postal"], name: "index_villages_on_name_and_code_postal", unique: true
    t.index ["region_id"], name: "index_villages_on_region_id"
    t.index ["score"], name: "index_villages_on_score"
  end

  add_foreign_key "contributions", "spots"
  add_foreign_key "contributions", "users"
  add_foreign_key "photos", "spots"
  add_foreign_key "photos", "users"
  add_foreign_key "spots", "users", column: "creator_id"
  add_foreign_key "spots", "users", column: "planted_by_id"
  add_foreign_key "spots", "villages"
  add_foreign_key "user_badges", "badges"
  add_foreign_key "user_badges", "users"
  add_foreign_key "users", "villages"
  add_foreign_key "villages", "regions"
end
