class ContentBlocksController < ApplicationController
  load_and_authorize_resource except: :index
  before_action :load_featured_researchers, only: :index
  authorize_resource only: :index

  def index
  end

  def create
    @content_block.save
    if respond_to? :redirect_back
      redirect_back fallback_location: sufia.content_blocks_path
    else
      # Deprecated in Rails 5.0
      redirect_to :back
    end
  end

  def update
    @content_block.update(update_params)
    if respond_to? :redirect_back
      redirect_back fallback_location: sufia.content_blocks_path
    else
      # Deprecated in Rails 5.0
      redirect_to :back
    end
  end

  protected

    def create_params
      params.require(:content_block).permit([:name, :value, :external_key])
    end

    def update_params
      params.require(:content_block).permit([:value, :external_key])
    end

    def load_featured_researchers
      @content_blocks = ContentBlock.recent_researchers.page(params[:page])
    end
end
