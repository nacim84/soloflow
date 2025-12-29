/**
 * Generic Action Response Type
 * Used for server actions to return success or error states
 */

export type ActionResponse<T = void> = T extends void
  ?
      | {
          success: true;
        }
      | {
          success: false;
          error: string;
        }
  :
      | {
          success: true;
          data: T;
        }
      | {
          success: false;
          error: string;
        };

/**
 * Extract the data type from an ActionResponse
 * Useful for type inference in components
 */
export type ExtractActionData<T> = T extends ActionResponse<infer D>
  ? D
  : never;
