defmodule ConsoleWeb.DeviceController do
  use ConsoleWeb, :controller

  alias Console.Devices
  alias Console.Devices.Device

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def index(conn, _params) do
    current_team =
      conn.assigns.current_team
      |> Console.Teams.fetch_assoc([devices: :groups])

    render(conn, "index.json", devices: current_team.devices)
  end

  def create(conn, %{"device" => device_params}) do
    current_team = conn.assigns.current_team
    device_params = Map.merge(device_params, %{"team_id" => current_team.id})

    with {:ok, %Device{} = device} <- Devices.create_device(device_params) do
      broadcast(device, "new")

      conn
      |> put_status(:created)
      |> put_resp_header("location", device_path(conn, :show, device))
      |> render("show.json", device: device)
    end
  end

  def show(conn, %{"id" => id}) do
    device =
      Devices.get_device!(id)
      |> Devices.fetch_assoc([:events, :groups])
    render(conn, "show.json", device: device)
  end

  def update(conn, %{"id" => id, "device" => device_params}) do
    device = Devices.get_device!(id)

    with {:ok, %Device{} = device} <- Devices.update_device(device, device_params) do
      conn
      |> put_resp_header("message", "#{device.name} updated successfully")
      |> render("show.json", device: device)
    end
  end

  def delete(conn, %{"id" => id}) do
    device = Devices.get_device!(id)

    with {:ok, %Device{}} <- Devices.delete_device(device) do
      broadcast(device, "delete")
      send_resp(conn, :no_content, "")
    end
  end

  defp broadcast(%Device{} = device, action) do
    device = Devices.fetch_assoc(device, [:team])
    body = ConsoleWeb.DeviceView.render("show.json", device: device)
    ConsoleWeb.Endpoint.broadcast("device:#{device.team.id}", action, body)
  end
end
