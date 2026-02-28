class ApplicationController < ActionController::API
  before_action :authorize_request

  private

  def authorize_request
    header = request.headers["Authorization"]
    token = header&.split(" ")&.last

    if token
      decoded = JsonWebToken.decode(token)
      @current_user = User.find_by(id: decoded[:user_id]) if decoded
    end

    render json: { error: "Non autorisé" }, status: :unauthorized unless @current_user
  end

  def current_user
    @current_user
  end

  def require_role!(*roles)
    unless roles.map(&:to_s).include?(current_user.role)
      render json: { error: "Accès interdit" }, status: :forbidden
    end
  end
end
