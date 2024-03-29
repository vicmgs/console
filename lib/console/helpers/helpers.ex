defmodule Console.Helpers do
  def time_ago_more_than?(datetime, num, period) do
    time_difference_in_seconds(DateTime.utc_now(), DateTime.from_naive!(datetime, "Etc/UTC")) > time_in_seconds(num, period)
  end

  def time_difference_in_seconds(datetime1, datetime2) do
    DateTime.diff(datetime1, datetime2)
  end

  def time_in_seconds(num, period) do
    case period do
      "Day" -> 24 * 60 * 60 * num
    end
  end
end
