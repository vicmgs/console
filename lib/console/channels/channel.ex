defmodule Console.Channels.Channel do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Teams.Team
  alias Console.Events.Event
  alias Console.Channels
  alias Console.Groups
  alias Console.Groups.Group
  alias Console.Groups.ChannelsGroups

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "channels" do
    field :active, :boolean, default: false
    field :credentials, Cloak.EncryptedMapField
    field :encryption_version, :binary
    field :name, :string
    field :type, :string

    belongs_to :team, Team
    has_many :events, Event, on_delete: :delete_all
    many_to_many :groups, Group, join_through: ChannelsGroups, on_replace: :delete
    has_many :devices, through: [:groups, :devices]

    timestamps()
  end

  @doc false
  def changeset(channel, attrs \\ %{}) do
    channel
    |> cast(attrs, ~w(name type active credentials team_id))
    |> validate_required([:name, :type, :active, :credentials, :team_id])
    |> put_change(:encryption_version, Cloak.version)
    |> filter_credentials()
  end

  def create_changeset(channel, attrs \\ %{}) do
    channel
    |> changeset(attrs)
    |> put_token()
  end

  def update_changeset(channel, attrs \\ %{}) do
    channel = channel |> Channels.fetch_assoc([:groups])

    changeset =
      channel
      |> changeset(attrs)

    changeset
    |> put_assoc(:groups, parse_groups(changeset, attrs))
  end

  defp put_token(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{type: "http", credentials: creds}} ->
        filtered_headers = Enum.reject(creds["headers"], fn(h) -> h["header"] == "" end)
        creds = Map.merge(creds, %{ "headers" => filtered_headers })

        put_change(changeset, :credentials, creds)
      _ -> changeset
    end
  end

  defp filter_credentials(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{type: "http", credentials: creds}} ->
        put_change(changeset, :credentials, Map.merge(creds, %{inbound_token: generate_token(16)}))
      _ -> changeset
    end
  end

  defp generate_token(length) do
    :crypto.strong_rand_bytes(length)
    |> Base.url_encode64
    |> binary_part(0, length)
  end

  defp parse_groups(changeset, attrs) do
    (attrs["groups"] || "")
    |> String.split(",")
    |> Enum.map(&String.trim/1)
    |> Enum.reject(& &1 == "")
    |> Groups.insert_and_get_all_by_names(changeset.data.team_id)
  end
end
