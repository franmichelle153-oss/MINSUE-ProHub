using System.Data;
using System.Data.SqlClient;
using MINSUE_ProHub.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;

namespace MINSUE_ProHub.Controllers.DBCLASSES
{
    public class ReservationLogicDb
    {
        private readonly string _connectionString;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ReservationLogicDb(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _httpContextAccessor = httpContextAccessor;
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(Configuration.GetConnectionString("DefaultConnection"));
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
                        UserId = reader.GetString(8)
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
                    UserId = reader.GetString(8)
                };
            }
            return null;
        }

        // Create new reservation
        public async Task<int> CreateReservationAsync(Reservation reservation)
        {
            using var connection = GetConnection();
            await connection.OpenAsync();
            using var command = new SqlCommand(
  "INSERT INTO MINSUEProHub.dbo.Reservations (StudentName, StudentId, Email, YearLevel, ProductId, QuantityOrder, DateToClaim, UserId) " +
             "VALUES (@StudentName, @StudentId, @Email, @YearLevel, @ProductId, @QuantityOrder, @DateToClaim, @UserId); " +
       "SELECT SCOPE_IDENTITY();", connection);

            command.Parameters.AddWithValue("@StudentName", reservation.StudentName);
            command.Parameters.AddWithValue("@StudentId", reservation.StudentId);
            command.Parameters.AddWithValue("@Email", reservation.Email);
            command.Parameters.AddWithValue("@YearLevel", reservation.YearLevel);
            command.Parameters.AddWithValue("@ProductId", reservation.ProductId);
            command.Parameters.AddWithValue("@QuantityOrder", reservation.QuantityOrder);
            command.Parameters.AddWithValue("@DateToClaim", reservation.DateToClaim);
            command.Parameters.AddWithValue("@UserId", reservation.UserId);

            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt32(result);
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
            command.Parameters.AddWithValue("@UserId", reservation.UserId);

            return await command.ExecuteNonQueryAsync() > 0;
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
            return await command.ExecuteNonQueryAsync() > 0;
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

            command.Parameters.AddWithValue("@UserId", userId);

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
            UserId = reader.GetString(8)
   });
    }
            return reservations;
        }

        public async Task<bool> CreateReservation(ReservationModel reservation)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                using (SqlCommand command = new SqlCommand("sp_CreateReservation", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    // Get user email from session
           var userEmail = _httpContextAccessor.HttpContext?.User?.Identity?.Name;
         if (string.IsNullOrEmpty(userEmail))
       {
                      throw new UnauthorizedAccessException("User must be logged in to make a reservation");
      }

      command.Parameters.AddWithValue("@Email", userEmail);
          command.Parameters.AddWithValue("@ProductName", reservation.ProductName);
  command.Parameters.AddWithValue("@Quantity", reservation.Quantity);
        command.Parameters.AddWithValue("@PickupDate", reservation.PickupDate);
    command.Parameters.AddWithValue("@Notes", (object)reservation.Notes ?? DBNull.Value);
     command.Parameters.AddWithValue("@Status", "Pending");
               command.Parameters.AddWithValue("@CreatedDate", DateTime.UtcNow);

 try
               {
  int result = await command.ExecuteNonQueryAsync();
            return result > 0;
                    }
       catch (SqlException ex)
          {
              // Log the error here if you have logging configured
     throw new Exception("Database error occurred while creating reservation", ex);
      }
     }
     }
     }
    }
}