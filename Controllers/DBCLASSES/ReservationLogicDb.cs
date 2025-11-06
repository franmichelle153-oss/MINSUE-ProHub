using System.Data;
using MINSUE_ProHub.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace MINSUE_ProHub.Controllers.DBCLASSES
{
    public class ReservationLogicDb
    {
        private readonly string _connectionString;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<ReservationLogicDb> _logger;

        public ReservationLogicDb(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ILogger<ReservationLogicDb> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(_connectionString);
        }

        // Get all reservations
        public async Task<List<Reservation>> GetAllReservationsAsync()
        {
            var reservations = new List<Reservation>();
            using (var connection = GetConnection())
            {
                await connection.OpenAsync();
                using var command = new SqlCommand(
                    "SELECT ReservationId, StudentName, StudentId, Email, YearLevel, ProductId, QuantityOrder, DateToClaim, UserId " +
                    "FROM MINSUEProHub.dbo.Reservations", connection);

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    reservations.Add(new Reservation
                    {
                        ReservationId = reader.GetInt32(0),
                        StudentName = reader.GetString(1),
                        StudentId = reader.GetString(2),
                        Email = reader.GetString(3),
                        YearLevel = reader.GetString(4),
                        ProductId = reader.GetInt32(5),
                        QuantityOrder = reader.GetInt32(6),
                        DateToClaim = reader.GetDateTime(7),
                        UserId = reader.IsDBNull(8) ? null : reader.GetValue(8).ToString()
                    });
                }
            }
            return reservations;
        }

        // Get reservation by ID
        public async Task<Reservation> GetReservationByIdAsync(int reservationId)
        {
            using var connection = GetConnection();
            await connection.OpenAsync();
            using var command = new SqlCommand(
                "SELECT ReservationId, StudentName, StudentId, Email, YearLevel, ProductId, QuantityOrder, DateToClaim, UserId " +
                "FROM MINSUEProHub.dbo.Reservations WHERE ReservationId = @ReservationId", connection);

            command.Parameters.AddWithValue("@ReservationId", reservationId);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new Reservation
                {
                    ReservationId = reader.GetInt32(0),
                    StudentName = reader.GetString(1),
                    StudentId = reader.GetString(2),
                    Email = reader.GetString(3),
                    YearLevel = reader.GetString(4),
                    ProductId = reader.GetInt32(5),
                    QuantityOrder = reader.GetInt32(6),
                    DateToClaim = reader.GetDateTime(7),
                    UserId = reader.IsDBNull(8) ? null : reader.GetValue(8).ToString()
                };
            }
            return null;
        }

        // Create new reservation
        public async Task<int> CreateReservationAsync(Reservation reservation)
        {
            using var connection = GetConnection();
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();

            try
            {
                // Ensure product exists
                using var existCommand = new SqlCommand(
                    "SELECT COUNT(1) FROM MINSUEProHub.dbo.Products WHERE ProductId = @ProductId",
                    connection, transaction);
                existCommand.Parameters.AddWithValue("@ProductId", reservation.ProductId);
                var existsObj = await existCommand.ExecuteScalarAsync();
                var exists = Convert.ToInt32(existsObj) >0;
                if (!exists)
                {
                    throw new InvalidOperationException("Product not found");
                }

                // Detect which stock column (if any) exists in the Products table
                string stockColumn = null;
                using (var colCmd = new SqlCommand(@"
SELECT TOP(1) COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='Products' AND COLUMN_NAME IN (
 'QuantityAvailable','QuantityInStock','Quantity','StockQuantity','Quantity_Left','Qty')", connection, transaction))
                {
                    using var reader = await colCmd.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        stockColumn = reader.GetString(0);
                    }
                }

                int? availableQuantity = null;
                if (!string.IsNullOrEmpty(stockColumn))
                {
                    // Get available quantity dynamically
                    using var availCmd = new SqlCommand($"SELECT {stockColumn} FROM MINSUEProHub.dbo.Products WHERE ProductId = @ProductId", connection, transaction);
                    availCmd.Parameters.AddWithValue("@ProductId", reservation.ProductId);
                    var availObj = await availCmd.ExecuteScalarAsync();
                    if (availObj != DBNull.Value && availObj != null)
                    {
                        availableQuantity = Convert.ToInt32(availObj);
                    }

                    if (!availableQuantity.HasValue)
                    {
                        throw new InvalidOperationException("Product not found");
                    }

                    if (availableQuantity.Value < reservation.QuantityOrder)
                    {
                        throw new InvalidOperationException($"Insufficient quantity available. Only {availableQuantity.Value} items left in stock.");
                    }
                }
                else
                {
                    // No stock column found, log and continue without stock enforcement
                    _logger?.LogWarning("No known stock column found in Products table; skipping stock availability check and update.");
                }

                // Build insert and (optionally) update SQL
                string updateClause = string.Empty;
                if (!string.IsNullOrEmpty(stockColumn))
                {
                    updateClause = $"UPDATE MINSUEProHub.dbo.Products SET {stockColumn} = {stockColumn} - @QuantityOrder WHERE ProductId = @ProductId;";
                }

                using var command = new SqlCommand(
                    $@"INSERT INTO MINSUEProHub.dbo.Reservations 
                      (StudentName, StudentId, Email, YearLevel, ProductId, QuantityOrder, DateToClaim, UserId) 
                      VALUES (@StudentName, @StudentId, @Email, @YearLevel, @ProductId, @QuantityOrder, @DateToClaim, @UserId);

                      {updateClause}
                      SELECT SCOPE_IDENTITY();", connection, transaction);

                command.Parameters.AddWithValue("@StudentName", reservation.StudentName);
                command.Parameters.AddWithValue("@StudentId", reservation.StudentId);
                command.Parameters.AddWithValue("@Email", reservation.Email);
                command.Parameters.AddWithValue("@YearLevel", reservation.YearLevel);
                command.Parameters.AddWithValue("@ProductId", reservation.ProductId);
                command.Parameters.AddWithValue("@QuantityOrder", reservation.QuantityOrder);
                command.Parameters.AddWithValue("@DateToClaim", reservation.DateToClaim);

                // Handle UserId parameter: pass int if parsable, otherwise DBNull
                if (!string.IsNullOrEmpty(reservation.UserId) && int.TryParse(reservation.UserId, out var parsedUserId))
                {
                    command.Parameters.AddWithValue("@UserId", parsedUserId);
                }
                else
                {
                    command.Parameters.AddWithValue("@UserId", DBNull.Value);
                }

                var result = await command.ExecuteScalarAsync();

                await transaction.CommitAsync();
                return Convert.ToInt32(result);
            }
            catch (SqlException ex)
            {
                await transaction.RollbackAsync();
                throw new InvalidOperationException($"Database error: {ex.Message}");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // Update existing reservation
        public async Task<bool> UpdateReservationAsync(Reservation reservation)
        {
            using var connection = GetConnection();
            await connection.OpenAsync();
            using var command = new SqlCommand(
                "UPDATE MINSUEProHub.dbo.Reservations " +
                "SET StudentName = @StudentName, StudentId = @StudentId, Email = @Email, " +
                "YearLevel = @YearLevel, ProductId = @ProductId, QuantityOrder = @QuantityOrder, " +
                "DateToClaim = @DateToClaim, UserId = @UserId " +
                "WHERE ReservationId = @ReservationId", connection);

            command.Parameters.AddWithValue("@ReservationId", reservation.ReservationId);
            command.Parameters.AddWithValue("@StudentName", reservation.StudentName);
            command.Parameters.AddWithValue("@StudentId", reservation.StudentId);
            command.Parameters.AddWithValue("@Email", reservation.Email);
            command.Parameters.AddWithValue("@YearLevel", reservation.YearLevel);
            command.Parameters.AddWithValue("@ProductId", reservation.ProductId);
            command.Parameters.AddWithValue("@QuantityOrder", reservation.QuantityOrder);
            command.Parameters.AddWithValue("@DateToClaim", reservation.DateToClaim);

            if (!string.IsNullOrEmpty(reservation.UserId) && int.TryParse(reservation.UserId, out var parsedUid))
            {
                command.Parameters.AddWithValue("@UserId", parsedUid);
            }
            else
            {
                command.Parameters.AddWithValue("@UserId", DBNull.Value);
            }

            return await command.ExecuteNonQueryAsync() >0;
        }

        // Delete reservation
        public async Task<bool> DeleteReservationAsync(int reservationId)
        {
            using var connection = GetConnection();
            await connection.OpenAsync();
            using var command = new SqlCommand(
                "DELETE FROM MINSUEProHub.dbo.Reservations WHERE ReservationId = @ReservationId",
                connection);

            command.Parameters.AddWithValue("@ReservationId", reservationId);
            return await command.ExecuteNonQueryAsync() >0;
        }

        // Get reservations by user ID
        public async Task<List<Reservation>> GetReservationsByUserIdAsync(string userId)
        {
            var reservations = new List<Reservation>();
            using var connection = GetConnection();
     await connection.OpenAsync();
            using var command = new SqlCommand(
                "SELECT ReservationId, StudentName, StudentId, Email, YearLevel, ProductId, QuantityOrder, DateToClaim, UserId " +
                "FROM MINSUEProHub.dbo.Reservations WHERE UserId = @UserId", connection);

            // If the supplied userId cannot be converted to int, pass DBNull so query doesn't throw; it will simply return no rows.
 if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out var u))
 {
 command.Parameters.AddWithValue("@UserId", u);
 }
 else
 {
 command.Parameters.AddWithValue("@UserId", DBNull.Value);
 }

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                reservations.Add(new Reservation
                {
                    ReservationId = reader.GetInt32(0),
                    StudentName = reader.GetString(1),
                    StudentId = reader.GetString(2),
                    Email = reader.GetString(3),
                    YearLevel = reader.GetString(4),
                    ProductId = reader.GetInt32(5),
                    QuantityOrder = reader.GetInt32(6),
                    DateToClaim = reader.GetDateTime(7),
                    UserId = reader.IsDBNull(8) ? null : reader.GetValue(8).ToString()
                });
            }
            return reservations;
        }

        // Add a new reservation
        public async Task AddReservationAsync(Reservation reservation)
        {
            using (var connection = GetConnection())
            {
           await connection.OpenAsync();
        using var command = new SqlCommand(
       "INSERT INTO MINSUEProHub.dbo.Reservations (StudentName, StudentId, Email, YearLevel, ProductId, QuantityOrder, DateToClaim, UserId) " +
       "VALUES (@StudentName, @StudentId, @Email, @YearLevel, @ProductId, @QuantityOrder, @DateToClaim, @UserId)", connection);

  command.Parameters.AddWithValue("@StudentName", reservation.StudentName);
      command.Parameters.AddWithValue("@StudentId", reservation.StudentId);
     command.Parameters.AddWithValue("@Email", reservation.Email);
           command.Parameters.AddWithValue("@YearLevel", reservation.YearLevel);
          command.Parameters.AddWithValue("@ProductId", reservation.ProductId);
             command.Parameters.AddWithValue("@QuantityOrder", reservation.QuantityOrder);
    command.Parameters.AddWithValue("@DateToClaim", reservation.DateToClaim);

 if (!string.IsNullOrEmpty(reservation.UserId) && int.TryParse(reservation.UserId, out var parsed))
 {
 command.Parameters.AddWithValue("@UserId", parsed);
 }
 else
 {
 command.Parameters.AddWithValue("@UserId", DBNull.Value);
 }

  await command.ExecuteNonQueryAsync();
      }
        }
    }
}